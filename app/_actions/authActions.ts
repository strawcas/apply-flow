"use server";

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/app/_lib/supabase";
import { siteUrl } from "@/app/_lib/site-url";
import { requireGoogleUser } from "@/app/_lib/session";
import { createProfile, getProfile, confirmProfileEmail } from "@/app/_db/profiles";
import { registrationDestination, validateProfile } from "@/app/_lib/auth-policy";
import { sendRegistrationConfirmation } from "@/app/_lib/registration-email";

export type AuthState = { message: string };

async function startGoogle(intent: "login" | "signup") {
    const supabase = await createClient();
    const nonce = randomBytes(24).toString("hex");
    const callback = new URL("/auth/callback", siteUrl());
    callback.searchParams.set("flow", nonce);
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.href, queryParams: { prompt: "select_account" } },
    });
    if (error || !data.url) return { message: "Google sign-in could not start. Please try again." };
    (await cookies()).set("applyflow_oauth", JSON.stringify({ intent, nonce }), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/auth/callback",
        maxAge: 600,
    });
    redirect(data.url);
}

export async function signInWithGoogle(): Promise<AuthState> {
    return startGoogle("login");
}

export async function signUpWithGoogle(): Promise<AuthState> {
    return startGoogle("signup");
}

export async function completeSignup(_state: AuthState, formData: FormData): Promise<AuthState> {
    const { user, email, success } = await requireGoogleUser();
    if (!user || !email || !success) {
        redirect("/login");
    }
    const fullName = formData.get("fullName");
    const birthDate = formData.get("birthDate");
    const message = validateProfile(fullName, birthDate);
    if (message) return { message };
    let profile;
    try {
        await createProfile(user.id, email, (fullName as string).trim(), birthDate as string);
        profile = await getProfile(user.id);
    } catch {
        return { message: "We couldn't save your profile. Please try again shortly." };
    }
    if (registrationDestination(profile, email) === "/dashboard") redirect("/dashboard");
    try {
        await sendRegistrationConfirmation(user.id, email);
    } catch {
        redirect("/confirm-email?notice=send-failed");
    }
    redirect("/confirm-email");
}

export async function resendConfirmation(): Promise<AuthState> {
    const { user, email, success } = await requireGoogleUser();
    if (!user || !email || !success) {
        redirect("/login");
    }

    const profile = await getProfile(user.id);
    if (!profile) redirect("/signup/complete");
    if (profile.email !== email)
        return { message: "Your account email has changed. Contact support before continuing." };
    if (profile.email_confirmed_at) redirect("/dashboard");
    try {
        return { message: await sendRegistrationConfirmation(user.id, email) };
    } catch {
        return { message: "We couldn't send the email. Wait a minute and try again." };
    }
}

export async function confirmEmail(_state: AuthState, formData: FormData): Promise<AuthState> {
    const token = formData.get("token");
    if (typeof token !== "string") return { message: "This confirmation link is invalid." };
    let confirmed;
    try {
        confirmed = await confirmProfileEmail(token);
    } catch {
        return { message: "We couldn't confirm your email. Please try again shortly." };
    }
    if (!confirmed)
        return {
            message:
                "This link has expired or was already used. Sign in to request another, or continue if you've already confirmed.",
        };
    redirect("/login?notice=confirmed");
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "local" });
    redirect("/login");
}
