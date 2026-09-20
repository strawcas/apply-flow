"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { AuthButton, AuthField } from "./auth-fields";
import { AuthLogo } from "./auth-logo";
import styles from "./auth.module.css";

export function SignupForm() {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // Prevent a page reload while you implement signup.
    event.preventDefault();

    // TODO: Read the form values.
    // TODO: Validate the values and check that the passwords match.
    // TODO: Create the account and handle success or errors.
  }

  return (
    <form onSubmit={handleSubmit}>
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
