"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { AuthButton, AuthField } from "../_components/auth/auth-fields";
import { AuthLogo } from "../_components/auth/auth-logo";
import styles from "../_components/auth/auth.module.css";

export function LoginForm() {
    const [message, setMessage] = useState("");
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        // Connect the authentication provider here when it is available.
        setMessage("Sign-in is not available yet. Please try again once account access is enabled.");
    }
    return (
        <form onSubmit={handleSubmit}>
            <AuthLogo className={styles.welcomeIcon} />
            <header className={styles.formHeader}>
                <h1>Welcome Back</h1>
                <p>Sign in to your account to pick up where you left off.</p>
            </header>
            <AuthField
                label="Email"
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
            />
            <AuthField
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
            />
            <div className={styles.options}>
                <label className={styles.remember}>
                    <input type="checkbox" name="remember" />
                    Remember me
                </label>
                <button
                    type="button"
                    className={styles.textButton}
                    onClick={() =>
                        setMessage(
                            "Password recovery is not available yet. Please try again once account access is enabled.",
                        )
                    }
                >
                    Forgot password?
                </button>
            </div>
            <AuthButton>Sign In</AuthButton>
            <p role="status" className={message ? styles.message : styles.emptyMessage}>
                {message}
            </p>
            <p className={styles.switchForm}>
                Don’t have an account?{" "}
                <Link href="/signup">
                    Sign-up <span aria-hidden="true">↗</span>
                </Link>
            </p>
        </form>
    );
}
