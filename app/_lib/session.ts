import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getProfile } from "@/app/_db/profiles";
import { createClient } from "./supabase";
import { registrationDestination } from "./auth-policy";

export const requireGoogleUser = cache(async () => {
    const supabase = await createClient();
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser();

    if (error || !user?.email || !user.identities?.some((identity) => identity.provider === "google")) {
        return { error: "no session", success: false };
    }
    return { supabase, user, email: user.email, success: true };
});

// Call this again in every future protected data query / Server Action, not only layouts.
export const session = cache(async (redirectTo?: string) => {
    const data = await requireGoogleUser();
    if (!data.success || !data.user || !data.email) {
        if (redirectTo) {
            redirect(redirectTo);
        }
    } else {
        const { user, email } = data;
        const profile = await getProfile(user.id);
        const destination = registrationDestination(profile, email);
        if (destination !== "/dashboard" || !profile) redirect(destination);
        return profile;
    }
});
