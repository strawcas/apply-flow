// Integration check: all writes use temporary tables and roll back.
import "dotenv/config";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";
import pg from "pg";
import { getTableColumns } from "drizzle-orm";
import { calendarEvents } from "../drizzle/schema.ts";

test("calendar persistence enforces account isolation and database constraints", async () => {
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
    const originalQuery = pg.Pool.prototype.query;
    let currentUser = "00000000-0000-4000-8000-000000000001";
    globalThis.__calendarDbSession = () => (currentUser ? { user_id: currentUser } : undefined);
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (specifier === "server-only") return { shortCircuit: true, url: "data:text/javascript,export {}" };
            if (specifier === "@/app/_lib/session")
                return {
                    shortCircuit: true,
                    url: "data:text/javascript,export const session = async () => globalThis.__calendarDbSession();",
                };
            const modules = {
                "@/app/_db/index": "../app/_db/index.ts",
                "@/drizzle/schema": "../drizzle/schema.ts",
                "@/app/_lib/calendar": "../app/_lib/calendar.ts",
            };
            if (modules[specifier])
                return { shortCircuit: true, url: new URL(modules[specifier], import.meta.url).href };
            return next(specifier, context);
        },
    });
    try {
        await client.connect();
        // Catch a production schema mismatch before testing temporary fixtures.
        const columns = Object.values(getTableColumns(calendarEvents))
            .map(({ name }) => `"${name}"`)
            .join(", ");
        await client.query(`SELECT ${columns} FROM public.calendar_events LIMIT 0`);
        await client.query("BEGIN");
        await client.query("CREATE TEMP TABLE applyflow_calendar_test_users (user_id uuid PRIMARY KEY)");
        const otherUser = "00000000-0000-4000-8000-000000000002";
        await client.query("INSERT INTO applyflow_calendar_test_users VALUES ($1), ($2)", [currentUser, otherUser]);
        const rewrite = (query) =>
            query
                .replaceAll("public.calendar_events", "pg_temp.applyflow_calendar_test_events")
                .replaceAll('"calendar_events"', '"applyflow_calendar_test_events"')
                .replaceAll("public.users", "pg_temp.applyflow_calendar_test_users");
        const migration = rewrite(
            await readFile(new URL("../supabase/migrations/202610070001_calendar_events.sql", import.meta.url), "utf8"),
        ).replace("CREATE TABLE IF NOT EXISTS", "CREATE TEMP TABLE IF NOT EXISTS");
        await client.query(migration);
        await client.query(migration);
        const {
            rows: [access],
        } = await client.query(`SELECT relrowsecurity AS rls,
            has_table_privilege('anon', oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon,
            has_table_privilege('authenticated', oid, 'SELECT,INSERT,UPDATE,DELETE') AS browser
            FROM pg_class WHERE oid = 'pg_temp.applyflow_calendar_test_events'::regclass`);
        assert.deepEqual(access, { rls: true, anon: false, browser: false });
        pg.Pool.prototype.query = function (query, values) {
            return client.query(
                typeof query === "string" ? rewrite(query) : { ...query, text: rewrite(query.text) },
                values,
            );
        };
        const calendar = await import("../app/_db/calendar.ts");
        const values = {
            title: "Interview",
            kind: "Interview",
            date: "2026-10-07",
            time: "09:30",
            endTime: "10:30",
            company: "Example",
            location: null,
            notes: "Prepare questions",
        };
        await calendar.createCalendarEvent(currentUser, values);
        await calendar.createCalendarEvent(otherUser, { ...values, title: "Other account's event" });
        const ownEvents = await calendar.getCalendarEventsCurrentUser();
        assert.equal(ownEvents.length, 1);
        assert.equal(ownEvents[0].title, "Interview");
        assert.equal(ownEvents[0].date, "2026-10-07");
        assert.equal(ownEvents[0].time, "09:30");
        assert.equal(ownEvents[0].endTime, "10:30");
        assert.equal(ownEvents[0].kind, "Interview");
        assert.equal(ownEvents[0].location, null);
        const {
            rows: [stored],
        } = await client.query(
            "SELECT type, start_time, end_time, location FROM applyflow_calendar_test_events WHERE id = $1",
            [ownEvents[0].id],
        );
        assert.deepEqual(stored, { type: "interview", start_time: "09:30", end_time: "10:30", location: "" });
        const id = ownEvents[0].id;
        assert.equal(await calendar.updateCalendarEvent(id, otherUser, { ...values, title: "Forged edit" }), false);
        assert.equal(await calendar.deleteCalendarEvent(id, otherUser), false);
        assert.equal(
            await calendar.updateCalendarEvent(id, currentUser, {
                ...values,
                date: "2026-10-09",
                time: null,
                endTime: null,
                kind: "Reminder",
                company: null,
                notes: null,
            }),
            true,
        );
        assert.equal((await calendar.getCalendarEventsCurrentUser())[0].date, "2026-10-09");
        assert.equal((await calendar.getCalendarEventsCurrentUser())[0].time, null);
        assert.equal((await calendar.getCalendarEventsCurrentUser())[0].endTime, null);
        assert.equal((await calendar.getCalendarEventsCurrentUser())[0].kind, "Reminder");
        assert.equal((await calendar.getCalendarEventsCurrentUser())[0].notes, null);
        assert.equal((await calendar.getCalendarEventsCurrentUser())[0].company, null);
        for (const badValues of [
            { ...values, time: "24:00" },
            { ...values, endTime: "09:00" },
            { ...values, time: null, endTime: "10:00" },
            { ...values, notes: "a".repeat(2001) },
            { ...values, title: " " },
        ]) {
            await client.query("SAVEPOINT invalid_event");
            await assert.rejects(calendar.createCalendarEvent(currentUser, badValues));
            await client.query("ROLLBACK TO SAVEPOINT invalid_event");
        }
        assert.equal(await calendar.deleteCalendarEvent(id, currentUser), true);
        assert.equal((await calendar.getCalendarEventsCurrentUser()).length, 0);
        currentUser = otherUser;
        assert.equal((await calendar.getCalendarEventsCurrentUser())[0].title, "Other account's event");
        assert.equal(await calendar.deleteCalendarEvent(id, otherUser), false);
        currentUser = undefined;
        await assert.rejects(calendar.getCalendarEventsCurrentUser(), /No session/);
    } finally {
        pg.Pool.prototype.query = originalQuery;
        hooks.deregister();
        delete globalThis.__calendarDbSession;
        await client.query("ROLLBACK").catch(() => {});
        await client.end();
    }
});
