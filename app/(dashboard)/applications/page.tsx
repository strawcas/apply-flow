import { requireAccount } from "@/app/_lib/require-account";

export default async function ApplicationsPage() {
    await requireAccount();
    return (
        <header>
            <h1>Applications</h1>
            <p>Your application tracker will live here.</p>
        </header>
    );
}
