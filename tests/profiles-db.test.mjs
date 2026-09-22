// Explicit integration test: uses only temporary tables on DATABASE_URL.
// No real Auth users, profiles, or emails are created or modified.
import "dotenv/config";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { registerHooks } from "node:module";
import test from "node:test";
import pg from "pg";

test("registration persistence and confirmation tokens in PostgreSQL", async () => {
    const client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 8000 });
    const originalQuery = pg.Pool.prototype.query;
    const hooks = registerHooks({
        resolve(specifier, context, next) {
            if (specifier === "server-only") return { url: "data:text/javascript,export {}", shortCircuit: true };
            return next(specifier, context);
        },
    });
    try {
        await client.connect();
        await client.query("BEGIN");
        await client.query("CREATE TEMP TABLE applyflow_test_users (id uuid PRIMARY KEY, email text)");
        const rewrite = (sql) => sql.replaceAll("public.applyflow_profiles", "pg_temp.applyflow_test_profiles").replaceAll("auth.users", "pg_temp.applyflow_test_users");
        const migration = await readFile(new URL("../supabase/migrations/202609220001_applyflow_profiles.sql", import.meta.url), "utf8");
        await client.query(rewrite(migration).replace("CREATE TABLE IF NOT EXISTS", "CREATE TEMP TABLE IF NOT EXISTS"));
        pg.Pool.prototype.query = function (sql, values) { return client.query(rewrite(sql), values); };
        const profiles = await import("../app/_db/profiles.ts");
        const userId = "00000000-0000-4000-8000-000000000001";
        const email = "registration-test@example.invalid";
        await client.query("INSERT INTO applyflow_test_users VALUES ($1, $2)", [userId, email]);

        await profiles.createProfile(userId, email, "Original Name", "2000-02-29");
        await profiles.createProfile(userId, email, "Replacement Name", "2001-01-01");
        const profile = await profiles.getProfile(userId);
        assert.equal(profile.full_name, "Original Name", "repeat signup must not overwrite names");
        assert.equal(profile.birth_date, "2000-02-29");
        assert.equal(profile.email, email);
        assert.equal(profile.email_confirmed_at, null);

        const reservations = await Promise.all([
            profiles.reserveConfirmation(userId, email),
            profiles.reserveConfirmation(userId, email),
        ]);
        assert.equal(reservations.filter(Boolean).length, 1, "concurrent resends must respect cooldown");
        const first = reservations.find(Boolean);
        const stored = await client.query("SELECT confirmation_token_hash FROM applyflow_test_profiles");
        assert.equal(stored.rows[0].confirmation_token_hash, first.hash);
        assert.notEqual(first.hash, first.token);
        assert.equal(await profiles.confirmProfileEmail("bad token"), false);
        assert.equal(await profiles.confirmProfileEmail("f".repeat(64)), false);

        await client.query("UPDATE applyflow_test_profiles SET confirmation_expires_at = now() - interval '1 second'");
        assert.equal(await profiles.confirmProfileEmail(first.token), false, "expired link rejected");
        await client.query("UPDATE applyflow_test_profiles SET confirmation_sent_at = now() - interval '61 seconds'");
        const second = await profiles.reserveConfirmation(userId, email);
        assert.ok(second);
        assert.equal(await profiles.confirmProfileEmail(first.token), false, "resend invalidates previous link");

        await client.query("UPDATE applyflow_test_users SET email = 'changed@example.invalid'");
        assert.equal(await profiles.confirmProfileEmail(second.token), false, "old email cannot confirm a changed account");
        await client.query("UPDATE applyflow_test_users SET email = $1", [email]);
        const attempts = await Promise.all([profiles.confirmProfileEmail(second.token), profiles.confirmProfileEmail(second.token)]);
        assert.equal(attempts.filter(Boolean).length, 1, "confirmation is single use even on simultaneous clicks");
        assert.ok((await profiles.getProfile(userId)).email_confirmed_at);
        assert.equal(await profiles.reserveConfirmation(userId, email), null, "confirmed profiles cannot get new tokens");
        await profiles.createProfile(userId, email, "Another Name", "2002-01-01");
        assert.equal((await profiles.getProfile(userId)).full_name, "Original Name");
    } finally {
        pg.Pool.prototype.query = originalQuery;
        hooks.deregister();
        await client.query("ROLLBACK").catch(() => {});
        await client.end();
    }
});
