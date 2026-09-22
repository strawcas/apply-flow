"use client";

import Link from "next/link";
import { useActionState } from "react";
import { confirmEmail } from "@/app/_actions/auth";
import { AuthButton } from "@/app/_components/auth/auth-fields";
import styles from "@/app/_components/auth/auth.module.css";

export function ConfirmForm({ token }: { token: string }) {
    const [state, action, pending] = useActionState(confirmEmail, { message: "" });
    return <>
        <form action={action}>
            <header className={styles.formHeader}><h1>Confirm your email</h1><p>One last step to activate your ApplyFlow account.</p></header>
            <input type="hidden" name="token" value={token} />
            {!token && <p role="alert" className={styles.message}>This confirmation link is invalid. Sign in to request a new email.</p>}
            {state.message && <p role="alert" className={styles.message}>{state.message}</p>}
            <AuthButton disabled={pending || !token}>{pending ? "Confirming…" : "Confirm email address"}</AuthButton>
        </form>
        <p className={styles.switchForm}><Link href="/login">Back to sign in</Link></p>
    </>;
}
