"use client";

import { useActionState } from "react";
import { resendConfirmation, signOut } from "@/app/_actions/auth";
import { AuthButton } from "@/app/_components/auth/auth-fields";
import styles from "@/app/_components/auth/auth.module.css";

export function ResendForm() {
    const [state, action, pending] = useActionState(resendConfirmation, { message: "" });
    return <>
        <form action={action}>
            {state.message && <p role="status" className={styles.message}>{state.message}</p>}
            <AuthButton disabled={pending}>{pending ? "Sending…" : "Resend confirmation email"}</AuthButton>
        </form>
        <form action={signOut} className={styles.switchForm}><button type="submit" className={styles.textButton}>Sign out</button></form>
    </>;
}
