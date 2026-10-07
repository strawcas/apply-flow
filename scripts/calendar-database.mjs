import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
try {
    await client.connect();
    if (process.argv.includes("--inspect")) {
        const { rows: columns } = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'calendar_events'
            ORDER BY ordinal_position
        `);
        const { rows: constraints } = await client.query(`
            SELECT conname, pg_get_constraintdef(oid) AS definition
            FROM pg_constraint WHERE conrelid = to_regclass('public.calendar_events')
        `);
        console.log({ columns, constraints });
    }
    if (process.argv.includes("--apply")) {
        await client.query("BEGIN");
        const migration = await readFile(
            new URL("../supabase/migrations/202610070001_calendar_events.sql", import.meta.url),
            "utf8",
        );
        await client.query(migration);
        await client.query("COMMIT");
        console.log("Calendar migration applied.");
    }
    const { rows } = await client.query(`
        SELECT c.relrowsecurity AS rls_enabled,
            has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon_access,
            has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS browser_access
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'calendar_events'
    `);
    console.log(rows[0] ?? "Calendar migration has not been applied. Run with --apply.");
    if (rows.length) {
        // Validate the actual columns even if CREATE TABLE IF NOT EXISTS skipped
        // a pre-existing table with a different shape. No event data is read.
        await client.query(`SELECT id, user_id, title, type, event_date, start_time, end_time,
            company, location, notes, created_at FROM public.calendar_events LIMIT 0`);
        console.log("Calendar columns verified.");
    }
} catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error.code === "42703")
        console.error(
            "Calendar table columns do not match the app. Check the existing table schema before applying a migration.",
        );
    else
        console.error(
            `Calendar database operation failed (${error.code ?? "CONNECTION_ERROR"}). Check DATABASE_URL and network access.`,
        );
    process.exitCode = 1;
} finally {
    await client.end();
}
