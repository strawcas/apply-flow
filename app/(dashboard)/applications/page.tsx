import ApplicationsTable from "@/app/_components/dashboard/applications-table";
import { requireAccount } from "@/app/_lib/require-account";

export default async function ApplicationsPage() {
    await requireAccount();
    return <ApplicationsTable />;
}
