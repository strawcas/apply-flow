import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { session } from "@/app/_lib/session";
import { AuthShell } from "@/app/_components/auth/auth-shell";
import { LoginForm } from "@/app/login/login-form";

export const metadata: Metadata = {
    title: "Sign in | ApplyFlow",
    description: "Sign in to your ApplyFlow account.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
    if (await session()) redirect("/dashboard");
    const { notice } = await searchParams;
    return (
        <AuthShell>
            <LoginForm notice={typeof notice === "string" ? notice : undefined} />
        </AuthShell>
    );
}
