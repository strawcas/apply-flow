"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithGoogle, signUpWithGoogle } from "@/app/_actions/authActions";
import { AuthLogo } from "./auth-logo";

const notices: Record<string, string> = {
    "signup-first": "You haven't signed up for ApplyFlow yet. Choose Sign up to create your account first.",
    "oauth-failed": "Google sign-in was cancelled or expired. Please try again.",
    unavailable: "Account access is temporarily unavailable. Please try again shortly.",
    confirmed: "Your email is confirmed. You can now sign in with Google.",
};

export function GoogleForm({ intent, notice }: { intent: "login" | "signup"; notice?: string }) {
    const isSignup = intent === "signup";
    const [state, action, pending] = useActionState(isSignup ? signUpWithGoogle : signInWithGoogle, { message: "" });
    const message = state.message || (notice ? notices[notice] : "");
    return (
        <form action={action}>
            <AuthLogo className="block w-16 h-16 object-contain mb-[27px]" />
            <header className="mb-[34px] [&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:font-[550] [&_h1]:text-[34px] [&_h1]:tracking-[-1.3px] [&_h1]:leading-[1.2] [&_h1]:mx-0 [&_p]:text-[var(--muted)] [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p]:m-0 max-[700px]:[&_h1]:text-[32px]">
                <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
                <p>
                    {isSignup
                        ? "Start with Google, add your details, then confirm your email to finish signing up."
                        : "Sign in with the Google account you used to join ApplyFlow."}
                </p>
            </header>
            {message && (
                <p role="status" className="text-[var(--blue-text,#1e40af)] bg-[var(--blue-soft,#eff6ff)] rounded-[6px] text-[16px] leading-[1.6] p-3">
                    {message}
                </p>
            )}
            <button
                type="submit"
                className="flex items-center justify-center gap-3 w-full min-h-13 [border:1px_solid_var(--border-strong,#747775)] rounded-[7px] bg-[var(--surface,#fff)] text-[var(--text-primary,#1f1f1f)] text-[16px] font-normal cursor-pointer py-3 px-[18px] hover:bg-[var(--surface-hover,#f0f4f9)] disabled:opacity-[.65] disabled:cursor-wait [&_svg]:shrink-0"
                disabled={pending}
            >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path
                        fill="#4285F4"
                        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.61 0-4.83-1.76-5.62-4.13H3.04v2.59A10 10 0 0 0 12 22Z"
                    />
                    <path fill="#FBBC05" d="M6.38 13.92a6 6 0 0 1 0-3.84V7.49H3.04a10 10 0 0 0 0 9.02l3.34-2.59Z" />
                    <path
                        fill="#EA4335"
                        d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.95Z"
                    />
                </svg>
                {pending ? "Opening Google…" : "Continue with Google"}
            </button>
            <p className="[&_a:hover]:underline text-center text-[16px] text-[var(--muted)] mt-[27px] mb-0 mx-0 [&_a]:text-[var(--accent-foreground,var(--accent))] [&_a]:font-semibold [&_a]:ml-[3px]">
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Sign up"}</Link>
            </p>
        </form>
    );
}
