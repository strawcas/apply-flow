import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

test("settings and export endpoints authenticate every request and only access the current account", async (t) => {
    const calls = [];
    let authenticated = true;
    let failure = null;
    const application = {
        id: 9,
        companyName: "Current account",
        jobTitle: "Engineer",
        status: "Applied",
        deadline: "2026-10-14",
        interviewDate: "2026-10-16",
        interviewTime: "09:30",
        location: "",
        createdAt: new Date("2026-10-07T00:00:00Z"),
    };
    const event = {
        id: "event-1",
        source: "event",
        title: "Interview",
        kind: "Interview",
        date: "2026-10-15",
        time: "14:00",
        endTime: "15:00",
        company: "Current account",
        location: null,
        notes: null,
    };
    globalThis.__settingsServerTest = {
        session: async (redirectTo) => {
            if (!authenticated && redirectTo) throw new Error(`redirect:${redirectTo}`);
            return authenticated ? { user_id: "current-account" } : undefined;
        },
        requireGoogleUser: async () => ({
            success: authenticated,
            user: authenticated ? { id: "current-account" } : undefined,
            supabase: {
                auth: {
                    updateUser: async (values) => {
                        calls.push(["update", values]);
                        if (failure instanceof Error) throw failure;
                        return failure
                            ? { data: { user: null }, error: failure }
                            : { data: { user: { id: "current-account" } }, error: null };
                    },
                },
            },
        }),
        getAllApplicationsCurrentUser: async () => {
            calls.push(["applications"]);
            if (failure) throw failure;
            return [application];
        },
        getCalendarEventsCurrentUser: async () => {
            calls.push(["events"]);
            if (failure) throw failure;
            return [event];
        },
        revalidatePath: (...args) => calls.push(["revalidate", ...args]),
        redirect: (path) => {
            throw new Error(`redirect:${path}`);
        },
    };
    const modules = {
        "@/app/_lib/session": ["session", "requireGoogleUser"],
        "@/app/_db/applications": ["getAllApplicationsCurrentUser"],
        "@/app/_db/calendar": ["getCalendarEventsCurrentUser"],
        "next/cache": ["revalidatePath"],
        "next/navigation": ["redirect"],
    };
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (modules[specifier])
                return {
                    shortCircuit: true,
                    url: `data:text/javascript,${encodeURIComponent(modules[specifier].map((name) => `export const ${name} = (...args) => globalThis.__settingsServerTest.${name}(...args);`).join("\n"))}`,
                };
            const local = {
                "@/app/_lib/settings": "settings",
                "@/app/_lib/calendar": "calendar",
                "@/app/_lib/data-export": "data-export",
            };
            if (local[specifier])
                return { shortCircuit: true, url: new URL(`../app/_lib/${local[specifier]}.ts`, import.meta.url).href };
            return next(specifier, context);
        },
    });
    try {
        const { saveSettings } = await import("../app/_actions/settingsActions.ts");
        const { GET } = await import("../app/(dashboard)/settings/export/[format]/route.ts");
        const form = new FormData();
        const preferences = {
            calendarView: "agenda",
            weekStartsOn: 1,
            timeFormat: "24h",
            currency: "PHP",
            workMode: "Hybrid",
        };
        for (const [key, value] of Object.entries(preferences)) form.set(key, String(value));
        form.set("userId", "forged-account");
        form.set("admin", "true");
        form.set("full_name", "forged-profile");
        const request = (format) =>
            GET(new Request(`http://localhost/settings/export/${format}?userId=forged-account`), {
                params: Promise.resolve({ format }),
            });
        await t.test("saves only preference metadata through the authenticated client", async () => {
            assert.deepEqual(await saveSettings(form), {
                success: true,
                values: preferences,
                message: "Settings saved.",
            });
            assert.deepEqual(calls.splice(0), [
                ["update", { data: { applyflow_settings: preferences } }],
                ["revalidate", "/", "layout"],
            ]);
            form.set("timeFormat", "invalid");
            assert.equal((await saveSettings(form)).success, false);
            assert.deepEqual(calls.splice(0), []);
            form.set("timeFormat", "24h");
        });
        await t.test("downloads private CSV and calendar events plus application deadlines and interviews", async () => {
            const csv = await request("applications");
            assert.equal(csv.status, 200);
            assert.equal(csv.headers.get("Cache-Control"), "private, no-store");
            assert.equal(csv.headers.get("Content-Disposition"), 'attachment; filename="applyflow-applications.csv"');
            assert.match(await csv.text(), /Current account/);
            assert.deepEqual(calls.splice(0), [["applications"]]);
            const ics = await request("calendar");
            assert.equal(ics.headers.get("Content-Type"), "text/calendar; charset=utf-8");
            assert.equal(ics.headers.get("X-Content-Type-Options"), "nosniff");
            const contents = await ics.text();
            assert.equal((contents.match(/BEGIN:VEVENT/g) ?? []).length, 3);
            assert.ok(contents.includes("DTSTART;VALUE=DATE:20261014"));
            assert.ok(contents.includes("DTSTART:20261015T140000"));
            assert.ok(contents.includes("DTSTART:20261016T093000"));
            assert.deepEqual(calls.splice(0), [["applications"], ["events"]]);
            assert.equal((await request("unknown")).status, 404);
            assert.deepEqual(calls.splice(0), []);
        });
        await t.test("save and export failures return helpful errors without exposing service details", async () => {
            failure = new Error("private database and auth details");
            const result = await saveSettings(form);
            assert.equal(result.success, false);
            assert.doesNotMatch(result.message, /private database/);
            assert.equal(calls.splice(0).length, 1);
            for (const format of ["applications", "calendar"]) {
                const response = await request(format);
                assert.equal(response.status, 500);
                assert.doesNotMatch(await response.text(), /private database/);
                assert.deepEqual(calls.splice(0), [["applications"]]);
            }
            failure = { message: "private auth details" };
            assert.equal((await saveSettings(form)).success, false);
            assert.equal(calls.splice(0).length, 1);
            failure = null;
        });
        await t.test("unauthenticated requests cannot update preferences or read export data", async () => {
            authenticated = false;
            await assert.rejects(saveSettings(form), /redirect:\/login/);
            for (const format of ["applications", "calendar"]) {
                const response = await request(format);
                assert.equal(response.status, 401);
                assert.equal(response.headers.get("Cache-Control"), "private, no-store");
            }
            assert.deepEqual(calls.splice(0), []);
        });
    } finally {
        hooks.deregister();
        delete globalThis.__settingsServerTest;
    }
});
