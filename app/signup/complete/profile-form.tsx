"use client";

import { useActionState } from "react";
import { completeSignup, signOut } from "@/app/_actions/auth";
import { AuthButton, AuthField } from "@/app/_components/auth/auth-fields";
import styles from "@/app/_components/auth/auth.module.css";

export function ProfileForm({ email, fullName, today }: { email: string; fullName: string; today: string }) {
    const [state, action, pending] = useActionState(completeSignup, { message: "" });
    return <>
        <form action={action}>
            <header className={styles.formHeader}>
                <h1>Finish signing up</h1>
                <p>Add your details. We’ll then send a confirmation link to your Google email.</p>
            </header>
            <AuthField id="full-name" name="fullName" label="Full name" autoComplete="name" defaultValue={fullName} maxLength={100} pattern={".*\\S.*"} required />
            <AuthField id="birth-date" name="birthDate" label="Birthdate" type="date" autoComplete="bday" min="1900-01-01" max={today} required />
            <AuthField id="email" label="Google email" type="email" value={email} readOnly />
            {state.message && <p role="alert" className={styles.message}>{state.message}</p>}
            <AuthButton disabled={pending}>{pending ? "Creating your account…" : "Create account"}</AuthButton>
        </form>
        <form action={signOut} className={styles.switchForm}>
            <button type="submit" className={styles.textButton}>Use a different Google account</button>
        </form>
    </>;
}
