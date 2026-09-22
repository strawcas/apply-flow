import { requireAccount } from "@/app/_lib/require-account";

export default async function CalendarPage() {
    await requireAccount();
    return (
        <header>
            <h1>Calendar</h1>
            <p>Your interviews and upcoming events will live here.</p>
        </header>
    );
}
