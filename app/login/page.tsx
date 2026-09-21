import type { Metadata } from "next";
import { AuthShell } from "@/app/_components/auth/auth-shell";
import { LoginForm } from "@/app/login/login-form";

export const metadata: Metadata = {
    title: "Sign in | ApplyFlow",
    description: "Sign in to your ApplyFlow account.",
};

export default function LoginPage() {
    return (
        <AuthShell>
            <LoginForm />
        </AuthShell>
    );
}
