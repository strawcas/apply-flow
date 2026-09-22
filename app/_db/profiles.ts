import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { Pool } from "pg";

const globalDb = globalThis as unknown as { applyflowPool?: Pool };
const pool = globalDb.applyflowPool ?? new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 30000,
});
if (process.env.NODE_ENV !== "production") globalDb.applyflowPool = pool;

export type Profile = {
    user_id: string;
    full_name: string;
    birth_date: string;
    email: string;
    email_confirmed_at: Date | null;
};

export async function getProfile(userId: string) {
    const result = await pool.query<Profile>(
        `SELECT user_id, full_name, birth_date::text, email, email_confirmed_at
         FROM public.applyflow_profiles WHERE user_id = $1`, [userId],
    );
    return result.rows[0] ?? null;
}

export async function createProfile(userId: string, email: string, fullName: string, birthDate: string) {
    // A repeated signup must never overwrite an existing registration.
    await pool.query(
        `INSERT INTO public.applyflow_profiles (user_id, email, full_name, birth_date)
         VALUES ($1, $2, $3, $4) ON CONFLICT (user_id) DO NOTHING`,
        [userId, email, fullName, birthDate],
    );
}

export function hashConfirmationToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function reserveConfirmation(userId: string, email: string) {
    const token = randomBytes(32).toString("hex");
    const hash = hashConfirmationToken(token);
    // Atomic cooldown: concurrent submissions cannot send a burst of emails.
    const result = await pool.query(
        `UPDATE public.applyflow_profiles SET confirmation_token_hash = $3,
            confirmation_expires_at = now() + interval '24 hours', confirmation_sent_at = now()
         WHERE user_id = $1 AND email = $2 AND email_confirmed_at IS NULL
            AND (confirmation_sent_at IS NULL OR confirmation_sent_at <= now() - interval '60 seconds')
         RETURNING user_id`, [userId, email, hash],
    );
    return result.rowCount ? { token, hash } : null;
}

export async function discardConfirmation(userId: string, hash: string) {
    await pool.query(
        `UPDATE public.applyflow_profiles SET confirmation_token_hash = NULL, confirmation_expires_at = NULL
         WHERE user_id = $1 AND confirmation_token_hash = $2`, [userId, hash],
    );
}

export async function confirmProfileEmail(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) return false;
    // Consume once, and reject links if the Supabase account email has since changed.
    const result = await pool.query(
        `UPDATE public.applyflow_profiles AS p SET email_confirmed_at = now(),
            confirmation_token_hash = NULL, confirmation_expires_at = NULL
         FROM auth.users AS u
         WHERE p.user_id = u.id AND p.email = u.email AND p.confirmation_token_hash = $1
            AND p.confirmation_expires_at > now() AND p.email_confirmed_at IS NULL
         RETURNING p.user_id`, [hashConfirmationToken(token)],
    );
    return result.rowCount === 1;
}
