import { AuthShell } from "@/app/_components/auth/auth-shell";
import { ConfirmForm } from "./confirm-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirm email | ApplyFlow", referrer: "no-referrer" as const, robots: { index: false, follow: false } };

export default async function ConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
    const { token } = await searchParams;
    const validToken = typeof token === "string" && /^[a-f0-9]{64}$/.test(token) ? token : "";
    // GET does not consume the link: mail scanners cannot activate an account.
    return <AuthShell><ConfirmForm token={validToken} /></AuthShell>;
}
