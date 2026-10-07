import "dotenv/config";
import { readFile } from "node:fs/promises";
import { DrizzleQueryError, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

const db = drizzle({
    connection: { connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 },
});
try {
    if (process.argv.includes("--apply")) {
        await db.transaction(async (tx) => {
            const { rows: [tables] } = await tx.execute(sql`
                SELECT to_regclass('public.applyflow_profiles') IS NOT NULL AS has_profiles,
                       to_regclass('public.users') IS NOT NULL AS has_users
            `);
            // Bootstrap only an empty installation; reruns must not recreate the old table.
            if (!tables.has_profiles && !tables.has_users) {
                const initialSql = await readFile(new URL("../supabase/migrations/202609220001_applyflow_profiles.sql", import.meta.url), "utf8");
                await tx.execute(sql.raw(initialSql));
            }
            const renameSql = await readFile(new URL("../supabase/migrations/202609230001_rename_profiles_to_users.sql", import.meta.url), "utf8");
            await tx.execute(sql.raw(renameSql));
        });
        console.log("ApplyFlow users migrations applied.");
    }
    const { rows } = await db.execute(sql`
        SELECT c.relrowsecurity AS rls_enabled,
          has_table_privilege('anon', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon_access,
          has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE') AS browser_access
        FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' AND c.relname = 'users'
    `);
    console.log(rows[0] ?? "Users migrations have not been applied yet. Run with --apply.");
} catch (error) {
    const databaseError = error instanceof DrizzleQueryError ? error.cause ?? error : error;
    const code = databaseError.code || (/timeout|timed out/i.test(databaseError.message) ? "CONNECTION_TIMEOUT" : databaseError.name);
    console.error(code === "P0001" ? databaseError.message : `Database operation failed (${code}). Check DATABASE_URL and network access.`);
    process.exitCode = 1;
} finally {
    await db.$client.end();
}
