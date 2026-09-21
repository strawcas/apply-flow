"use client";

import Link from "next/link";
import type { SubmitEvent } from "react";
import { AuthButton, AuthField } from "../_components/auth/auth-fields";
import { AuthLogo } from "../_components/auth/auth-logo";
import styles from "../_components/auth/auth.module.css";
import { signUp } from "@/app/_actions/auth";

export function SignupForm() {
    function validatePasswords(form: HTMLFormElement) {
        const password = form.elements.namedItem("password");
        const confirmPassword = form.elements.namedItem("confirmPassword");

        if (password instanceof HTMLInputElement && confirmPassword instanceof HTMLInputElement) {
            confirmPassword.setCustomValidity(
                confirmPassword.value && password.value !== confirmPassword.value
                    ? "Passwords must match."
                    : "",
            );
        }
    }

    function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
        validatePasswords(event.currentTarget);

        if (!event.currentTarget.reportValidity()) {
            event.preventDefault();
        }
    }

    return (
        <form
            action={signUp}
            onSubmit={handleSubmit}
            onInput={(event) => validatePasswords(event.currentTarget)}
        >
            <AuthLogo className={styles.welcomeIcon} />
            <header className={styles.formHeader}>
                <h1>Create your account</h1>
                <p>Your next chapter starts here. Let’s get you set up.</p>
            </header>
            <AuthField
                label="Full name"
                id="full-name"
                name="fullName"
                autoComplete="name"
                placeholder="Enter your full name"
                pattern={".*\\S.*"}
                title="Please enter your name, not just spaces."
                required
            />
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
                autoComplete="new-password"
                placeholder="Create a password"
                required
            />
            <AuthField
                label="Confirm password"
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                required
            />
            <AuthButton>Create Account</AuthButton>
            <p className={styles.switchForm}>
                Already have an account?{" "}
                <Link href="/login">
                    Sign in <span aria-hidden="true">↗</span>
                </Link>
            </p>
        </form>
    );
}
