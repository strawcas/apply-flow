import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/app/_components/auth/auth-shell";
import styles from "@/app/_components/auth/auth.module.css";
import confirmationStyles from "./confirmation.module.css";

export const metadata: Metadata = {
    title: "Check your email | ApplyFlow",
    description: "Check your inbox and follow the confirmation link to confirm your ApplyFlow email address.",
};

export default function ConfirmEmailPage() {
    return (
        <AuthShell>
            <div>
                <div className={confirmationStyles.mailIcon} aria-hidden="true">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="5" width="18" height="14" rx="3" />
                        <path d="m4 7 8 6 8-6" />
                    </svg>
                </div>
                <header className={styles.formHeader}>
                    <p className={confirmationStyles.eyebrow}>ONE LAST STEP</p>
                    <h1>Check your email</h1>
                    <p>Open the email from ApplyFlow and click the confirmation link to confirm your email address and finish setting up your account.</p>
                </header>
                <div className={confirmationStyles.hint}>
                    <h2>Can’t find the email?</h2>
                    <p>Check your spam or junk folder. It may take a few minutes to arrive.</p>
                </div>
                <Link href="/login" className={styles.submit}>Back to log in <span aria-hidden="true">→</span></Link>
                <p className={styles.switchForm}>Used the wrong email? <Link href="/signup">Back to sign up</Link></p>
            </div>
        </AuthShell>
    );
}
