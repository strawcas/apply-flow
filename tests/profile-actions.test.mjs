import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

test("profile edits authenticate, validate, and update only the signed-in account", async (t) => {
    const calls = [];
    let profile = { user_id: "signed-in-user" };
    let updateResult = true;
    globalThis.__profileActionTest = {
        session: async () => profile,
        updateProfile: async (...args) => {
            calls.push(["update", ...args]);
            if (updateResult instanceof Error) throw updateResult;
            return updateResult;
        },
        revalidatePath: (path) => calls.push(["revalidate", path]),
        redirect: (path) => { throw new Error(`redirect:${path}`); },
    };
    const mockedModules = {
        "@/app/_lib/session": "session",
        "@/app/_db/profiles": "updateProfile",
        "next/cache": "revalidatePath",
        "next/navigation": "redirect",
    };
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            const name = mockedModules[specifier];
            if (name) return {
                url: `data:text/javascript,${encodeURIComponent(`export const ${name} = (...args) => globalThis.__profileActionTest.${name}(...args);`)}`,
                shortCircuit: true,
            };
            if (specifier === "@/app/_lib/auth-policy") return {
                url: new URL("../app/_lib/auth-policy.ts", import.meta.url).href,
                shortCircuit: true,
            };
            return next(specifier, context);
        },
    });
    try {
        const { saveProfile } = await import("../app/_actions/profileActions.ts");
        const form = new FormData();
        form.set("fullName", "  Updated Name  ");
        form.set("birthDate", "2000-02-29");
        form.set("userId", "another-user");
        form.set("email", "injected@example.invalid");

        await t.test("ignores forged account fields and refreshes the saved profile", async () => {
            const result = await saveProfile(form);
            assert.deepEqual(result, {
                success: true, message: "Your profile has been updated.",
                values: { fullName: "Updated Name", birthDate: "2000-02-29" },
            });
            assert.deepEqual(calls.splice(0), [
                ["update", "signed-in-user", "Updated Name", "2000-02-29"], ["revalidate", "/profile"],
            ]);
        });
        await t.test("rejects invalid input without writing", async () => {
            form.set("birthDate", "2001-02-29");
            assert.equal((await saveProfile(form)).success, false);
            assert.deepEqual(calls, []);
            form.set("birthDate", "2000-02-29");
        });
        await t.test("handles missing records and database errors without reporting success", async () => {
            for (const failure of [false, new Error("private database detail")]) {
                updateResult = failure;
                const result = await saveProfile(form);
                assert.equal(result.success, false);
                assert.doesNotMatch(result.message, /private database detail/);
                assert.equal(calls.splice(0).length, 1, "failed writes do not invalidate the page");
            }
        });
        await t.test("redirects unauthenticated requests without writing", async () => {
            profile = undefined;
            await assert.rejects(saveProfile(form), /redirect:\/login/);
            assert.deepEqual(calls, []);
        });
    } finally {
        hooks.deregister();
        delete globalThis.__profileActionTest;
    }
});
