import DashboardOverview from "@/app/_components/dashboard/dashboard-overview";
import { requireAccount } from "@/app/_lib/require-account";

export default async function DashboardPage() {
    await requireAccount();
    return <DashboardOverview />;
}
