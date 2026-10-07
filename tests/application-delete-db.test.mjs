import "dotenv/config";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import pg from "pg";

test("application deletion removes only the selected owner's record", async () => {
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
        // All mutations target a temporary table and are rolled back; real applications are never changed.
        await client.query("CREATE TEMP TABLE applyflow_application_delete_test (LIKE public.applications INCLUDING DEFAULTS)");
        const owner = "00000000-0000-4000-8000-000000000001";
        const otherOwner = "00000000-0000-4000-8000-000000000002";
        await client.query(
            `INSERT INTO applyflow_application_delete_test
                (id, company_name, job_title, status, location, work_mode, employment_type, user_id)
             VALUES (1, 'Example', 'Engineer', 'Applied', 'Remote', 'Remote', 'Full-time', $1),
                    (2, 'Other account', 'Engineer', 'Applied', 'Remote', 'Remote', 'Full-time', $2)`,
            [owner, otherOwner],
        );
        const rewrite = (query) => query.replaceAll('"applications"', '"applyflow_application_delete_test"');
        pg.Pool.prototype.query = function (query, values) {
            return client.query(typeof query === "string" ? rewrite(query) : { ...query, text: rewrite(query.text) }, values);
        };
        const { deleteApplicationById } = await import("../app/_db/applications.ts");
        assert.equal(await deleteApplicationById(1, otherOwner), false);
        assert.equal(await deleteApplicationById(2, owner), false);
        assert.equal(await deleteApplicationById(1, owner), true);
        assert.equal(await deleteApplicationById(1, owner), false);
        const { rows } = await client.query("SELECT id, user_id FROM applyflow_application_delete_test ORDER BY id");
        assert.deepEqual(rows, [{ id: "2", user_id: otherOwner }]);
    } finally {
        pg.Pool.prototype.query = originalQuery;
        hooks.deregister();
        await client.query("ROLLBACK").catch(() => {});
        await client.end();
    }
});
