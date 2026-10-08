// Integration check: all writes target temporary tables and roll back.
import "dotenv/config";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";
import pg from "pg";

test("application interviews persist, reschedule, clear, and enforce account ownership and date/time constraints", async () => {
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
    const originalQuery = pg.Pool.prototype.query;
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (specifier === "server-only") return { shortCircuit: true, url: "data:text/javascript,export {}" };
            if (specifier === "@/app/_lib/session")
                return { shortCircuit: true, url: "data:text/javascript,export const session = async () => undefined;" };
            const modules = {
                "@/app/_db/index": "../app/_db/index.ts",
                "@/drizzle/schema": "../drizzle/schema.ts",
            };
            if (modules[specifier]) return { shortCircuit: true, url: new URL(modules[specifier], import.meta.url).href };
            return next(specifier, context);
        },
    });
    try {
        await client.connect();
        await client.query("BEGIN");
        await client.query(
            "CREATE TEMP TABLE applyflow_interview_test (LIKE public.applications INCLUDING DEFAULTS INCLUDING CONSTRAINTS)",
        );
        const migration = (
            await readFile(new URL("../supabase/migrations/202610080001_application_interviews.sql", import.meta.url), "utf8")
        ).replaceAll("public.applications", "pg_temp.applyflow_interview_test");
        await client.query(migration);
        await client.query(migration);
        const rewrite = (query) => query.replaceAll('"applications"', '"applyflow_interview_test"');
        pg.Pool.prototype.query = function (query, values) {
            return client.query(typeof query === "string" ? rewrite(query) : { ...query, text: rewrite(query.text) }, values);
        };
        const { createApplication, getAllApplicationsById, updateApplicationById } = await import("../app/_db/applications.ts");
        const owner = "00000000-0000-4000-8000-000000000001";
        const otherOwner = "00000000-0000-4000-8000-000000000002";
        const base = {
            companyName: "Example",
            jobTitle: "Engineer",
            status: "Interview",
            location: "Remote",
            workMode: "Remote",
            employmentType: "Full-time",
        };
        const created = await createApplication({
            ...base,
            id: 10,
            userId: owner,
            interviewDate: "2026-10-15",
            interviewTime: "09:30",
        });
        assert.equal(created.interviewDate, "2026-10-15");
        assert.equal(created.interviewTime, "09:30");
        const unscheduled = await createApplication({ ...base, id: 11, userId: otherOwner });
        assert.equal(unscheduled.interviewDate, null);
        assert.equal(unscheduled.interviewTime, null);
        assert.deepEqual((await getAllApplicationsById(owner)).map((row) => row.id), [10]);
        assert.equal(await updateApplicationById(10, otherOwner, { interviewDate: "2026-10-16" }), undefined);
        const rescheduled = await updateApplicationById(10, owner, {
            interviewDate: "2026-10-16",
            interviewTime: "14:00",
        });
        assert.equal(rescheduled.interviewDate, "2026-10-16");
        assert.equal(rescheduled.interviewTime, "14:00");
        const progressed = await updateApplicationById(10, owner, { status: "Offer" });
        assert.equal(progressed.interviewDate, "2026-10-16");
        const dateOnly = await updateApplicationById(10, owner, { interviewTime: null });
        assert.equal(dateOnly.interviewDate, "2026-10-16");
        assert.equal(dateOnly.interviewTime, null);
        const cleared = await updateApplicationById(10, owner, { interviewDate: null, interviewTime: null });
        assert.equal(cleared.interviewDate, null);
        assert.equal(cleared.interviewTime, null);

        for (const [date, time] of [["1899-12-31", null], ["2026-10-15", "24:00"], ["2026-10-15", "09:60"], [null, "09:30"]]) {
            await client.query("SAVEPOINT invalid_interview");
            await assert.rejects(
                client.query("UPDATE applyflow_interview_test SET interview_date = $1, interview_time = $2 WHERE id = 10", [date, time]),
                (error) => error.code === "23514",
            );
            await client.query("ROLLBACK TO SAVEPOINT invalid_interview");
        }
    } finally {
        pg.Pool.prototype.query = originalQuery;
        hooks.deregister();
        await client.query("ROLLBACK").catch(() => {});
        await client.end();
    }
});
