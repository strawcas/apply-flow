import { requireAccount } from "@/app/_lib/require-account";

export default async function SettingsPage() {
    await requireAccount();
    return (
        <header>
            <h1>Settings</h1>
            <p>Your account preferences will live here.</p>
        </header>
    );
}
