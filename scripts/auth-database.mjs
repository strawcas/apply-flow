import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
try {
    await client.connect();
    if (process.argv.includes("--apply")) {
        const sql = await readFile(new URL("../supabase/migrations/202609220001_applyflow_profiles.sql", import.meta.url), "utf8");
        await client.query("BEGIN");
        await client.query(sql);
        await client.query("COMMIT");
        console.log("ApplyFlow profile migration applied.");
    }
    const { rows } = await client.query(`
        SELECT c.relrowsecurity AS rls_enabled,
          has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon_access,
          has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS browser_access
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'applyflow_profiles'
    `);
    console.log(rows[0] ?? "Profile migration has not been applied yet.");
} catch (error) {
    console.error(`Database operation failed (${error.code || error.name}). Check DATABASE_URL and network access.`);
    process.exitCode = 1;
} finally {
    await client.end();
}
