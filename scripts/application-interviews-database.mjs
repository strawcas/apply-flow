import "dotenv/config";
import { readFile } from "node:fs/promises";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
try {
    await client.connect();
    if (process.argv.includes("--apply")) {
        await client.query("BEGIN");
        await client.query("SET LOCAL lock_timeout = '5s'");
        const migration = await readFile(
            new URL("../supabase/migrations/202610080001_application_interviews.sql", import.meta.url),
            "utf8",
        );
        await client.query(migration);
        await client.query("COMMIT");
        console.log("Application interview migration applied.");
    }
    await client.query("SELECT interview_date, interview_time FROM public.applications LIMIT 0");
    console.log("Application interview columns verified.");
} catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    console.error(`Application interview database operation failed (${error.code ?? "CONNECTION_ERROR"}).`);
    process.exitCode = 1;
} finally {
    await client.end();
}
