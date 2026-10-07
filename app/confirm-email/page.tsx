import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthShell } from "@/app/_components/auth/auth-shell";
import { requireGoogleUser } from "@/app/_lib/session";
import { getProfile } from "@/app/_db/profiles";
import { ResendForm } from "./resend-form";

export const metadata = { title: "Check your email | ApplyFlow" };

export default async function ConfirmEmailPage({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
    const { user, email, success } = await requireGoogleUser();
    if (!user || !email || !success) redirect("/login");
    const profile = await getProfile(user.id);
    if (!profile) redirect("/signup/complete");
    if (profile.email_confirmed_at && profile.email === email) redirect("/dashboard");
    const { notice } = await searchParams;
    return (
        <AuthShell>
            <header className="mb-[34px] [&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:font-[550] [&_h1]:text-[34px] [&_h1]:tracking-[-1.3px] [&_h1]:leading-[1.2] [&_h1]:mx-0 [&_p]:text-[var(--muted)] [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p]:m-0 max-[700px]:[&_h1]:text-[32px]">
                <h1>Check your email</h1>
                <p>
                    Confirm <strong>{profile.email}</strong> to finish signing up. Open the link in our email and choose
                    “Confirm email address.”
                </p>
            </header>
            {notice === "send-failed" && (
                <p role="alert" className="text-[var(--blue-text,#1e40af)] bg-[var(--blue-soft,#eff6ff)] rounded-[6px] text-[16px] leading-[1.6] p-3">
                    Your details are saved, but we couldn’t send your email. Please try again below.
                </p>
            )}
            <p className="text-[var(--blue-text,#1e40af)] bg-[var(--blue-soft,#eff6ff)] rounded-[6px] text-[16px] leading-[1.6] p-3">
                Check your spam folder too. Links expire in 24 hours, and you can request a new one once a minute.
            </p>
            <ResendForm />
            <p className="[&_a:hover]:underline text-center text-[16px] text-[var(--muted)] mt-[27px] mb-0 mx-0 [&_a]:text-[var(--accent-foreground,var(--accent))] [&_a]:font-semibold [&_a]:ml-[3px]">
                <Link href="/dashboard">I’ve confirmed my email — continue</Link>
            </p>
        </AuthShell>
    );
}
