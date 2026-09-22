import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/app/_components/auth/auth-shell";
import { requireGoogleUser } from "@/app/_lib/require-account";
import { getProfile } from "@/app/_db/profiles";
import styles from "@/app/_components/auth/auth.module.css";
import { ResendForm } from "./resend-form";

export const metadata = { title: "Check your email | ApplyFlow" };

export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
    const { user, email } = await requireGoogleUser();
    const profile = await getProfile(user.id);
    if (!profile) redirect("/signup/complete");
    if (profile.email_confirmed_at && profile.email === email) redirect("/dashboard");
    const { notice } = await searchParams;
    return <AuthShell>
        <header className={styles.formHeader}>
            <h1>Check your email</h1>
            <p>Confirm <strong>{profile.email}</strong> to finish signing up. Open the link in our email and choose “Confirm email address.”</p>
        </header>
        {notice === "send-failed" && <p role="alert" className={styles.message}>Your details are saved, but we couldn’t send your email. Please try again below.</p>}
        <p className={styles.message}>Check your spam folder too. Links expire in 24 hours, and you can request a new one once a minute.</p>
        <ResendForm />
        <p className={styles.switchForm}><Link href="/dashboard">I’ve confirmed my email — continue</Link></p>
    </AuthShell>;
}
