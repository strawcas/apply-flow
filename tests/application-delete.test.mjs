import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

test("application deletion authenticates, validates ownership, and refreshes affected pages", async (t) => {
    const calls = [];
    let user = { user_id: "current-user" };
    let deleted = true;
    globalThis.__applicationDeleteTest = {
        session: async () => user,
        deleteApplicationById: async (...args) => {
            calls.push(["delete", ...args]);
            if (deleted instanceof Error) throw deleted;
            return deleted;
        },
        revalidatePath: (path) => calls.push(["revalidate", path]),
        redirect: (path) => {
            throw new Error(`redirect:${path}`);
        },
    };
    const modules = {
        "@/app/_lib/session": ["session"],
        "@/app/_db/applications": ["createApplication", "updateApplicationById", "deleteApplicationById"],
        "next/cache": ["revalidatePath"],
        "next/navigation": ["redirect"],
    };
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (specifier === "@/app/_lib/calendar")
                return { shortCircuit: true, url: new URL("../app/_lib/calendar.ts", import.meta.url).href };
            if (modules[specifier])
                return {
                    shortCircuit: true,
                    url: `data:text/javascript,${encodeURIComponent(modules[specifier].map((name) => `export const ${name} = (...args) => globalThis.__applicationDeleteTest.${name}(...args);`).join("\n"))}`,
                };
            return next(specifier, context);
        },
    });

    try {
        const { deleteApplicationAction } = await import("../app/_actions/applicationActions.ts");
        await t.test("deletes using the authenticated owner and refreshes applications, dashboard, and calendar", async () => {
            assert.deepEqual(await deleteApplicationAction(7), { success: true, message: "Application deleted." });
            assert.deepEqual(calls.splice(0), [
                ["delete", 7, "current-user"],
                ["revalidate", "/applications"],
                ["revalidate", "/dashboard"],
                ["revalidate", "/calendar"],
            ]);
        });
        await t.test("rejects malformed IDs before reaching the database", async () => {
            for (const id of [0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, "7", null]) {
                assert.equal((await deleteApplicationAction(id)).success, false);
            }
            assert.deepEqual(calls, []);
        });
        await t.test("missing and other-account applications never report a successful deletion", async () => {
            deleted = false;
            assert.equal((await deleteApplicationAction(7)).success, false);
            assert.deepEqual(calls.splice(0), [["delete", 7, "current-user"]]);
        });
        await t.test("database errors return a useful message without exposing database details", async () => {
            deleted = new Error("private connection details");
            assert.deepEqual(await deleteApplicationAction(7), {
                success: false,
                message: "Your application could not be deleted. Please try again.",
            });
            assert.deepEqual(calls.splice(0), [["delete", 7, "current-user"]]);
        });
        await t.test("signed-out users are redirected without deleting anything", async () => {
            user = null;
            await assert.rejects(deleteApplicationAction(7), /redirect:\/login/);
            assert.deepEqual(calls, []);
        });
    } finally {
        hooks.deregister();
        delete globalThis.__applicationDeleteTest;
    }
});
