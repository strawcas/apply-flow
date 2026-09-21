import type { Metadata } from "next";
import { AuthShell } from "@/app/_components/auth/auth-shell";
import { SignupForm } from "@/app/signup/signup-form";

export const metadata: Metadata = {
    title: "Sign up | ApplyFlow",
    description: "Create your ApplyFlow account.",
};

export default function SignupPage() {
    return (
        <AuthShell>
            <SignupForm />
        </AuthShell>
    );
}
