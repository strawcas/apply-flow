import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

test("calendar mutations authenticate, validate, and scope writes to the signed-in account", async (t) => {
    const calls = [];
    let user = { user_id: "signed-in-user" };
    let writeResult = true;
    globalThis.__calendarActionTest = {
        session: async () => user,
        createCalendarEvent: async (...args) => {
            calls.push(["create", ...args]);
            if (writeResult instanceof Error) throw writeResult;
        },
        updateCalendarEvent: async (...args) => {
            calls.push(["update", ...args]);
            if (writeResult instanceof Error) throw writeResult;
            return writeResult;
        },
        deleteCalendarEvent: async (...args) => {
            calls.push(["delete", ...args]);
            if (writeResult instanceof Error) throw writeResult;
            return writeResult;
        },
        revalidatePath: (path) => calls.push(["revalidate", path]),
        redirect: (path) => {
            throw new Error(`redirect:${path}`);
        },
    };
    const modules = {
        "@/app/_lib/session": ["session"],
        "@/app/_db/calendar": ["createCalendarEvent", "updateCalendarEvent", "deleteCalendarEvent"],
        "next/cache": ["revalidatePath"],
        "next/navigation": ["redirect"],
    };
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (modules[specifier])
                return {
                    shortCircuit: true,
                    url: `data:text/javascript,${encodeURIComponent(modules[specifier].map((name) => `export const ${name} = (...args) => globalThis.__calendarActionTest.${name}(...args);`).join("\n"))}`,
                };
            if (specifier === "@/app/_lib/calendar")
                return { shortCircuit: true, url: new URL("../app/_lib/calendar.ts", import.meta.url).href };
            return next(specifier, context);
        },
    });
    try {
        const { saveCalendarEvent, removeCalendarEvent } = await import("../app/_actions/calendarActions.ts");
        const id = "00000000-0000-4000-8000-000000000001";
        const form = new FormData();
        form.set("title", "  Interview  ");
        form.set("kind", "Interview");
        form.set("date", "2026-10-07");
        form.set("userId", "forged-user");
        form.set("id", "forged-id");
        form.set("source", "application");
        const values = {
            title: "Interview",
            kind: "Interview",
            date: "2026-10-07",
            time: null,
            endTime: null,
            company: null,
            location: null,
            notes: null,
        };
        await t.test("creates and edits only allowed fields; never trusts account data from the browser", async () => {
            assert.equal((await saveCalendarEvent(null, form)).success, true);
            assert.deepEqual(calls.splice(0), [
                ["create", "signed-in-user", values],
                ["revalidate", "/calendar"],
            ]);
            assert.equal((await saveCalendarEvent(id, form)).success, true);
            assert.deepEqual(calls.splice(0), [
                ["update", id, "signed-in-user", values],
                ["revalidate", "/calendar"],
            ]);
            assert.equal((await removeCalendarEvent(id)).success, true);
            assert.deepEqual(calls.splice(0), [
                ["delete", id, "signed-in-user"],
                ["revalidate", "/calendar"],
            ]);
        });
        await t.test("rejects invalid events and generated application deadlines before writing", async () => {
            form.set("date", "2026-02-30");
            assert.equal((await saveCalendarEvent(null, form)).success, false);
            form.set("date", "2026-10-07");
            assert.equal((await saveCalendarEvent("application-1", form)).success, false);
            assert.equal((await removeCalendarEvent("application-1")).success, false);
            assert.deepEqual(calls, []);
        });
        await t.test("missing or other-account records are not reported as saved or deleted", async () => {
            writeResult = false;
            assert.equal((await saveCalendarEvent(id, form)).success, false);
            assert.equal((await removeCalendarEvent(id)).success, false);
            assert.deepEqual(calls.splice(0), [
                ["update", id, "signed-in-user", values],
                ["delete", id, "signed-in-user"],
            ]);
        });
        await t.test("database failures preserve privacy and do not invalidate successful UI", async () => {
            writeResult = new Error("private database information");
            for (const result of [
                await saveCalendarEvent(null, form),
                await saveCalendarEvent(id, form),
                await removeCalendarEvent(id),
            ]) {
                assert.equal(result.success, false);
                assert.doesNotMatch(result.message, /private database information/);
            }
            assert.equal(calls.splice(0).length, 3);
        });
        await t.test("all mutation paths reject unauthenticated callers", async () => {
            user = undefined;
            await assert.rejects(saveCalendarEvent(null, form), /redirect:\/login/);
            await assert.rejects(saveCalendarEvent(id, form), /redirect:\/login/);
            await assert.rejects(removeCalendarEvent(id), /redirect:\/login/);
            assert.deepEqual(calls, []);
        });
    } finally {
        hooks.deregister();
        delete globalThis.__calendarActionTest;
    }
});
