import { getAllApplicationsCurrentUser } from "@/app/_db/applications";
import ApplicationsTableClient from "./applications-table-client";

export default async function ApplicationsTable() {
    const applications = await getAllApplicationsCurrentUser();
    return <ApplicationsTableClient applications={applications} />;
}
