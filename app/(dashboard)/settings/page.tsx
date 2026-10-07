import type { Metadata } from "next";
import SettingsOverview from "@/app/_components/dashboard/settings-overview";
import { getSettingsCurrentUser } from "@/app/_lib/account-settings";

export const metadata: Metadata = { title: "Settings | ApplyFlow" };

export default async function SettingsPage() {
    return <SettingsOverview settings={await getSettingsCurrentUser()} />;
}
