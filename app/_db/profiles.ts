import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { and, eq, isNull, lte, or, sql } from "drizzle-orm";

import { db } from "@/app/_db";
import { users } from "@/drizzle/schema";

export type Profile = {
    user_id: string;
    full_name: string;
    birth_date: string;
    email: string;
    email_confirmed_at: Date | null;
};

export async function getProfile(userId: string) {
    const [profile] = await db
        .select({
            user_id: users.userId,
            full_name: users.fullName,
            birth_date: users.birthDate,
            email: users.email,
            email_confirmed_at: users.emailConfirmedAt,
        })
        .from(users)
        .where(eq(users.userId, userId));

    return profile ?? null;
}

export async function createProfile(userId: string, email: string, fullName: string, birthDate: string) {
    // A repeated signup must never overwrite an existing registration.
    await db
        .insert(users)
        .values({
            userId,
            email,
            fullName,
            birthDate,
        })
        .onConflictDoNothing({
            target: users.userId,
        });
}

export function hashConfirmationToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
}

export async function reserveConfirmation(userId: string, email: string) {
    const token = randomBytes(32).toString("hex");
    const hash = hashConfirmationToken(token);

    // Atomic cooldown: concurrent submissions cannot send a burst of emails.
    const [reserved] = await db
        .update(users)
        .set({
            confirmationTokenHash: hash,
            confirmationExpiresAt: sql`now() + interval '24 hours'`,
            confirmationSentAt: sql`now()`,
        })
        .where(
            and(
                eq(users.userId, userId),
                eq(users.email, email),
                isNull(users.emailConfirmedAt),
                or(isNull(users.confirmationSentAt), lte(users.confirmationSentAt, sql`now() - interval '60 seconds'`)),
            ),
        )
        .returning({
            userId: users.userId,
        });

    return reserved ? { token, hash } : null;
}

export async function discardConfirmation(userId: string, hash: string) {
    await db
        .update(users)
        .set({
            confirmationTokenHash: null,
            confirmationExpiresAt: null,
        })
        .where(and(eq(users.userId, userId), eq(users.confirmationTokenHash, hash)));
}

export async function confirmProfileEmail(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) return false;

    const hash = hashConfirmationToken(token);

    const [confirmed] = await db
        .update(users)
        .set({
            emailConfirmedAt: sql`now()`,
            confirmationTokenHash: null,
            confirmationExpiresAt: null,
        })
        .where(
            and(
                eq(users.confirmationTokenHash, hash),
                sql`${users.confirmationExpiresAt} > now()`,
                isNull(users.emailConfirmedAt),

                // Reject the link if the Supabase Auth email
                // no longer matches the profile email.
                sql`
                    EXISTS (
                        SELECT 1
                        FROM auth.users AS auth_user
                        WHERE auth_user.id = ${users.userId}
                          AND auth_user.email = ${users.email}
                    )
                `,
            ),
        )
        .returning({
            userId: users.userId,
        });

    return confirmed !== undefined;
}
