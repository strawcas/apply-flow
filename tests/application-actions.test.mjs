import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

test("application saves handle saved statuses and validate optional interview schedules", async () => {
    const writes = [];
    globalThis.__applicationStatusTest = {
        session: async () => ({ user_id: "current-user" }),
        createApplication: async (values) => {
            writes.push(values);
        },
        updateApplicationById: async (id, userId, values) => {
            writes.push({ id, userId, ...values });
            return { id };
        },
        deleteApplicationById: async () => {},
        revalidatePath: () => {},
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
                    url: `data:text/javascript,${encodeURIComponent(modules[specifier].map((name) => `export const ${name} = (...args) => globalThis.__applicationStatusTest.${name}(...args);`).join("\n"))}`,
                };
            return next(specifier, context);
        },
    });
    try {
        const { addApplication, updateApplicationAction } = await import("../app/_actions/applicationActions.ts");
        const form = new FormData();
        for (const [key, value] of Object.entries({
            companyName: "Example",
            jobTitle: "Engineer",
            status: "Saved",
            location: "Remote",
            workMode: "Remote",
            employmentType: "Full-time",
            dateApplied: "2026-10-07",
            deadline: "2026-10-21",
            jobUrl: "https://example.com/jobs/1",
            userId: "forged-user",
        }))
            form.set(key, value);
        await addApplication(form);
        assert.equal(writes[0].status, "Saved");
        assert.equal(writes[0].dateApplied, null);
        assert.equal(writes[0].deadline, "2026-10-21");
        assert.equal(writes[0].jobUrl, "https://example.com/jobs/1");
        assert.equal(writes[0].userId, "current-user");
        await updateApplicationAction(7, form);
        assert.equal(writes[1].status, "Saved");
        assert.equal(writes[1].dateApplied, null);
        assert.equal(writes[1].id, 7);
        assert.equal(writes[1].userId, "current-user");
        form.set("status", "Applied");
        await updateApplicationAction(7, form);
        assert.equal(writes[2].status, "Applied");
        assert.equal(writes[2].dateApplied, "2026-10-07");
        form.delete("dateApplied");
        form.set("status", "Saved");
        await addApplication(form);
        assert.equal(writes[3].dateApplied, null);
        assert.equal(writes[3].interviewDate, null);
        assert.equal(writes[3].interviewTime, null);

        form.set("status", "Interview");
        form.set("interviewDate", "2026-10-15");
        form.set("interviewTime", "09:30");
        await addApplication(form);
        assert.equal(writes.at(-1).interviewDate, "2026-10-15");
        assert.equal(writes.at(-1).interviewTime, "09:30");
        form.set("interviewDate", "2026-10-16");
        form.set("interviewTime", "14:00");
        await updateApplicationAction(7, form);
        assert.equal(writes.at(-1).interviewDate, "2026-10-16");
        assert.equal(writes.at(-1).interviewTime, "14:00");
        // Preserve the interview history when the application progresses.
        form.set("status", "Offer");
        await updateApplicationAction(7, form);
        assert.equal(writes.at(-1).interviewDate, "2026-10-16");
        form.set("interviewTime", "");
        await updateApplicationAction(7, form);
        assert.equal(writes.at(-1).interviewTime, null);
        form.set("interviewDate", "");
        await updateApplicationAction(7, form);
        assert.equal(writes.at(-1).interviewDate, null);

        const count = writes.length;
        for (const date of ["2026-02-30", "2026-13-01", "1899-12-31", "not-a-date"]) {
            form.set("interviewDate", date);
            await assert.rejects(addApplication(form), /valid interview date/);
        }
        form.set("interviewDate", "2026-10-15");
        for (const time of ["24:00", "09:60", "9:30", "not-a-time"]) {
            form.set("interviewTime", time);
            await assert.rejects(updateApplicationAction(7, form), /valid interview time/);
        }
        form.set("interviewDate", "");
        form.set("interviewTime", "09:30");
        await assert.rejects(addApplication(form), /valid interview time/);
        assert.equal(writes.length, count);
    } finally {
        hooks.deregister();
        delete globalThis.__applicationStatusTest;
    }
});
