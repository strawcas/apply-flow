"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInWithGoogle, signUpWithGoogle } from "@/app/_actions/auth";
import { AuthLogo } from "./auth-logo";
import styles from "./auth.module.css";

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
            <AuthLogo className={styles.welcomeIcon} />
            <header className={styles.formHeader}>
                <h1>{isSignup ? "Create your account" : "Welcome back"}</h1>
                <p>{isSignup ? "Start with Google, add your details, then confirm your email to finish signing up." : "Sign in with the Google account you used to join ApplyFlow."}</p>
            </header>
            {message && <p role="status" className={styles.message}>{message}</p>}
            <button type="submit" className={styles.googleButton} disabled={pending}>
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z" />
                    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.97-3.38.97-2.61 0-4.83-1.76-5.62-4.13H3.04v2.59A10 10 0 0 0 12 22Z" />
                    <path fill="#FBBC05" d="M6.38 13.92a6 6 0 0 1 0-3.84V7.49H3.04a10 10 0 0 0 0 9.02l3.34-2.59Z" />
                    <path fill="#EA4335" d="M12 5.95c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.34 2.59A5.99 5.99 0 0 1 12 5.95Z" />
                </svg>
                {pending ? "Opening Google…" : "Continue with Google"}
            </button>
            <p className={styles.switchForm}>
                {isSignup ? "Already have an account? " : "Don't have an account? "}
                <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Sign up"}</Link>
            </p>
        </form>
    );
}
