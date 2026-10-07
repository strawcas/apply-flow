import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { session } from "@/app/_lib/session";
import { AuthShell } from "@/app/_components/auth/auth-shell";
import { SignupForm } from "@/app/signup/signup-form";

export const metadata: Metadata = {
    title: "Sign up | ApplyFlow",
    description: "Create your ApplyFlow account.",
};

export default async function SignupPage() {
    if (await session()) redirect("/dashboard");
    return (
        <AuthShell>
            <SignupForm />
        </AuthShell>
    );
}
