export const applicationSortOptions = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "company-asc", label: "Company A–Z" },
    { value: "company-desc", label: "Company Z–A" },
] as const;

export type ApplicationSort = (typeof applicationSortOptions)[number]["value"];

type ApplicationListItem = {
    id: number;
    companyName: string;
    jobTitle: string;
    status: string;
    dateApplied: string | null;
    createdAt: Date | string;
};

function compareApplicationDates(a: ApplicationListItem, b: ApplicationListItem) {
    const dateOrder = (a.dateApplied ?? "").localeCompare(b.dateApplied ?? "");
    return dateOrder || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() || a.id - b.id;
}

export function filterAndSortApplications<T extends ApplicationListItem>(
    applications: readonly T[],
    { query, status, sort }: { query: string; status: string; sort: ApplicationSort },
): T[] {
    const search = query.trim().toLowerCase();
    return applications
        .filter(
            (application) =>
                (!status || application.status === status) &&
                `${application.companyName} ${application.jobTitle}`.toLowerCase().includes(search),
        )
        .sort((a, b) => {
            if (sort === "company-asc" || sort === "company-desc") {
                const companyOrder = a.companyName.localeCompare(b.companyName, "en", {
                    sensitivity: "base",
                    numeric: true,
                });
                if (companyOrder) return sort === "company-asc" ? companyOrder : -companyOrder;
            }

            // Undated applications stay last in either date direction.
            if (Boolean(a.dateApplied) !== Boolean(b.dateApplied)) return a.dateApplied ? -1 : 1;
            const dateOrder = compareApplicationDates(a, b);
            return sort === "oldest" ? dateOrder : -dateOrder;
        });
}
