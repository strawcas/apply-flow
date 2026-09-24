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
            // Resolve app aliases when running with Node's native TypeScript support.
            const modules = { "@/app/_db": "../app/_db/index.ts", "@/drizzle/schema": "../drizzle/schema.ts" };
            if (modules[specifier]) return { url: new URL(modules[specifier], import.meta.url).href, shortCircuit: true };
            return next(specifier, context);
        },
    });
    try {
        await client.connect();
        await client.query("BEGIN");
        await client.query("CREATE TEMP TABLE applyflow_test_users (id uuid PRIMARY KEY, email text)");
        const rewrite = (sql) => sql
            .replaceAll("public.applyflow_profiles", "pg_temp.applyflow_test_profiles_legacy")
            .replaceAll("public.users", "pg_temp.applyflow_test_profiles")
            .replaceAll('"users"', '"applyflow_test_profiles"')
            .replaceAll("auth.users", "pg_temp.applyflow_test_users")
            .replaceAll("CONSTRAINT applyflow_profiles_", "CONSTRAINT applyflow_test_profiles_legacy_")
            .replace("RENAME TO users", "RENAME TO applyflow_test_profiles");
        const migration = await readFile(new URL("../supabase/migrations/202609220001_applyflow_profiles.sql", import.meta.url), "utf8");
        await client.query(rewrite(migration).replace("CREATE TABLE IF NOT EXISTS", "CREATE TEMP TABLE IF NOT EXISTS"));
        const userId = "00000000-0000-4000-8000-000000000001";
        const email = "registration-test@example.invalid";
        await client.query("INSERT INTO applyflow_test_users VALUES ($1, $2)", [userId, email]);
        await client.query(`INSERT INTO applyflow_test_profiles_legacy (user_id, email, full_name, birth_date)
            VALUES ($1, $2, 'Original Name', '2000-02-29')`, [userId, email]);
        const rename = rewrite(await readFile(new URL("../supabase/migrations/202609230001_rename_profiles_to_users.sql", import.meta.url), "utf8"));
        await client.query("SAVEPOINT name_collision");
        await client.query("CREATE TEMP TABLE applyflow_test_profiles (id integer)");
        await assert.rejects(client.query(rename), /already exists/, "a name collision must not overwrite another table");
        await client.query("ROLLBACK TO SAVEPOINT name_collision");
        await client.query(rename);
        await client.query(rename); // Reapplying the rename is safe.
        const { rows: [renamed] } = await client.query(`SELECT
            to_regclass('pg_temp.applyflow_test_profiles_legacy') IS NULL AS old_name_gone,
            relrowsecurity AS rls_enabled,
            has_table_privilege('anon', oid, 'SELECT,INSERT,UPDATE,DELETE') AS anon_access,
            has_table_privilege('authenticated', oid, 'SELECT,INSERT,UPDATE,DELETE') AS browser_access
            FROM pg_class WHERE oid = 'pg_temp.applyflow_test_profiles'::regclass`);
        assert.deepEqual(renamed, { old_name_gone: true, rls_enabled: true, anon_access: false, browser_access: false });
        pg.Pool.prototype.query = function (query, values) {
            return client.query(typeof query === "string" ? rewrite(query) : { ...query, text: rewrite(query.text) }, values);
        };
        const profiles = await import("../app/_db/profiles.ts");
        assert.equal((await profiles.getProfile(userId)).full_name, "Original Name", "rename preserves existing registrations");
        await client.query("DELETE FROM applyflow_test_profiles WHERE user_id = $1", [userId]);

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

        const otherUserId = "00000000-0000-4000-8000-000000000002";
        const otherEmail = "other-profile-test@example.invalid";
        await client.query("INSERT INTO applyflow_test_users VALUES ($1, $2)", [otherUserId, otherEmail]);
        await profiles.createProfile(otherUserId, otherEmail, "Other Person", "1995-01-01");
        const beforeUpdate = await profiles.getProfile(userId);
        const otherProfile = await profiles.getProfile(otherUserId);

        assert.equal(await profiles.updateProfile(userId, "Updated Name", "1999-12-31"), true);
        assert.deepEqual(await profiles.getProfile(userId), {
            ...beforeUpdate,
            full_name: "Updated Name",
            birth_date: "1999-12-31",
        }, "editing personal details preserves email and verification");
        assert.deepEqual(await profiles.getProfile(otherUserId), otherProfile, "editing cannot modify another account");
        assert.equal(await profiles.updateProfile("00000000-0000-4000-8000-000000000003", "Missing", "2000-01-01"), false);
    } finally {
        pg.Pool.prototype.query = originalQuery;
        hooks.deregister();
        await client.query("ROLLBACK").catch(() => {});
        await client.end();
    }
});
