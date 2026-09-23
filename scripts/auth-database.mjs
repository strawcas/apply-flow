import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
try {
    await client.connect();
    if (process.argv.includes("--apply")) {
        await client.query("BEGIN");
        const { rows: [tables] } = await client.query(`
            SELECT to_regclass('public.applyflow_profiles') IS NOT NULL AS has_profiles,
                   to_regclass('public.users') IS NOT NULL AS has_users
        `);
        // Bootstrap only an empty installation; reruns must not recreate the old table.
        if (!tables.has_profiles && !tables.has_users) {
            const sql = await readFile(new URL("../supabase/migrations/202609220001_applyflow_profiles.sql", import.meta.url), "utf8");
            await client.query(sql);
        }
        const renameSql = await readFile(new URL("../supabase/migrations/202609230001_rename_profiles_to_users.sql", import.meta.url), "utf8");
        await client.query(renameSql);
        await client.query("COMMIT");
        console.log("ApplyFlow users migrations applied.");
    }
    const { rows } = await client.query(`
        SELECT c.relrowsecurity AS rls_enabled,
          has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon_access,
          has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS browser_access
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'users'
    `);
    console.log(rows[0] ?? "Users migrations have not been applied yet. Run with --apply.");
} catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(error.code === "P0001" ? error.message : `Database operation failed (${error.code || error.name}). Check DATABASE_URL and network access.`);
    process.exitCode = 1;
} finally {
    await client.end();
}
