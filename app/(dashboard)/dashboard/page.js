import DashboardOverview from "@/app/_components/dashboard/dashboard-overview";
import { getAllApplicationsCurrentUser } from "@/app/_db/applications";

export default async function DashboardPage() {
    const applications = await getAllApplicationsCurrentUser();
    const recentApplications = [...applications]
        .sort((a, b) => {
            const dateOrder = (b.dateApplied ?? "").localeCompare(a.dateApplied ?? "");
            return dateOrder || b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id;
        })
        .map(({ id, companyName, jobTitle, location, workMode, status, dateApplied }) => ({
            id,
            companyName,
            jobTitle,
            location,
            workMode,
            status,
            dateApplied,
        }));

    return <DashboardOverview applications={recentApplications} />;
}
