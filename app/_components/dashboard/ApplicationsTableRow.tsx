import { applications } from "@/drizzle/schema";
type Application = typeof applications.$inferSelect;
import Icon from "@/app/_components/dashboard/dashboard-icon";
import { deleteApplicationAction } from "@/app/_actions/applicationActions";

type ApplicationStatus = "Applied" | "In review" | "Interview" | "Offer" | "Rejected";

const statusStyles: Record<ApplicationStatus, string> = {
    Applied: "text-[#396ab6] bg-[#edf3ff]",
    "In review": "text-[#8b691e] bg-[#fff6e6]",
    Interview: "text-[#7957b0] bg-[#f2edfc]",
    Offer: "text-[#347b52] bg-[#edf8f0]",
    Rejected: "text-[#ab575b] bg-[#fdf0f1]",
};

function isApplicationStatus(value: string): value is ApplicationStatus {
    return Object.prototype.hasOwnProperty.call(statusStyles, value);
}

function getStatusStyle(status: string): string {
    return isApplicationStatus(status) ? statusStyles[status] : "text-gray-600 bg-gray-100";
}

export default function ApplicationsTableRow({ applicationData }: { applicationData: Application }) {
    async function handleDeleteApplication() {
        await deleteApplicationAction(applicationData.id);
    }

    return (
        <tr key={applicationData.id}>
            <th scope="row">
                <div className="flex items-center gap-3">
                    <span
                        className="grid place-items-center w-11 h-11 shrink-0 [border:1px_solid_#00000004] rounded-[9px] text-[24px] font-[650]"
                        aria-hidden="true"
                    >
                        {applicationData.companyName.charAt(0)}
                    </span>

                    <div className="grid gap-[6px] text-[14px] text-[#52637d] [&_strong]:text-[var(--ink)] [&_strong]:text-[16px] [&_strong]:font-semibold">
                        <strong>{applicationData.companyName}</strong>
                        <span>{applicationData.jobTitle}</span>
                    </div>
                </div>
            </th>

            <td>
                <span
                    className={`inline-flex items-center gap-2 rounded-[5px] text-[14px] font-medium py-[7px] px-[11px] ${getStatusStyle(applicationData.status)}`}
                >
                    <span className="w-[6px] h-[6px] rounded-full bg-current" aria-hidden="true" />
                    {applicationData.status}
                </span>
            </td>

            <td className="text-[#33465f] text-[16px]">{applicationData.location}</td>

            <td className="text-[#33465f] text-[16px]">{applicationData.workMode}</td>

            <td className="text-[#33465f] text-[16px]">{applicationData.employmentType}</td>

            <td className="text-[#42536d] text-[16px] tabular-nums">
                <time dateTime={applicationData.dateApplied ?? undefined}>
                    {applicationData.dateApplied ?? "No date"}
                </time>
            </td>

            <td>
                <div className="grid gap-[6px] text-[14px] text-[#52637d]">
                    {applicationData.deadline && (
                        <span className="text-[#33465f] text-[16px]">Deadline: {applicationData.deadline}</span>
                    )}
                </div>
            </td>

            <td className="w-16">
                <button
                    type="button"
                    className="inline-grid place-items-center w-11 h-11 [border:1px_solid_transparent] rounded-[6px] bg-transparent text-[#52637d] p-0 [&_svg]:w-5 [&_svg]:h-5"
                    aria-label={`More actions for ${applicationData.companyName} ${applicationData.jobTitle}`}
                >
                    <Icon name="more" />
                </button>
            </td>
        </tr>
    );
}
