import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/_lib/supabase";
import { getProfile } from "@/app/_db/profiles";
import { oauthDestination, readOAuthFlow } from "@/app/_lib/auth-policy";
import { siteUrl } from "@/app/_lib/site-url";

export async function GET(request: NextRequest) {
    const cookieStore = await cookies();
    const flowCookie = cookieStore.get("applyflow_oauth")?.value;
    cookieStore.set("applyflow_oauth", "", { path: "/auth/callback", maxAge: 0 });
    const go = (path: string) => {
        const response = NextResponse.redirect(new URL(path, siteUrl()));
        response.headers.set("Cache-Control", "private, no-store");
        return response;
    };
    const intent = readOAuthFlow(flowCookie, request.nextUrl.searchParams.get("flow"));
    const code = request.nextUrl.searchParams.get("code");
    if (!code || !intent) {
        return go("/login?notice=oauth-failed");
    }
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) return go("/login?notice=oauth-failed");
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user?.email || !user.identities?.some((identity) => identity.provider === "google")) {
        await supabase.auth.signOut({ scope: "local" });
        return go("/login?notice=oauth-failed");
    }
    try {
        const profile = await getProfile(user.id);
        const destination = oauthDestination(intent, profile, user.email);
        if (destination === "/login?notice=signup-first") {
            // OAuth may create an Auth identity, but never an ApplyFlow registration here.
            await supabase.auth.signOut({ scope: "local" });
            return go("/login?notice=signup-first");
        }
        return go(destination);
    } catch {
        await supabase.auth.signOut({ scope: "local" });
        return go("/login?notice=unavailable");
    }
}
