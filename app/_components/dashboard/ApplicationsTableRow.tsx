"use client";

import type { applications } from "@/drizzle/schema";
type Application = typeof applications.$inferSelect;
import Modal, { useModal } from "@/app/_components/Modal";
import EditApplication from "@/app/_components/dashboard/EditApplication";
import type { ApplicationStatus } from "@/app/_lib/application-status";
import { formatCalendarTime } from "@/app/_lib/calendar";
import { useSettings } from "./settings-provider";

const statusStyles: Record<ApplicationStatus, string> = {
    Saved: "text-[var(--text-secondary,#52637d)] bg-[var(--surface-subtle,#f0f3f7)]",
    Applied: "text-[var(--blue-text,#396ab6)] bg-[var(--blue-soft,#edf3ff)]",
    "In review": "text-[var(--amber-text,#8b691e)] bg-[var(--amber-soft,#fff6e6)]",
    Interview: "text-[var(--purple-text,#7957b0)] bg-[var(--purple-soft,#f2edfc)]",
    Offer: "text-[var(--green-text,#347b52)] bg-[var(--green-soft,#edf8f0)]",
    Rejected: "text-[var(--red-text,#ab575b)] bg-[var(--red-soft,#fdf0f1)]",
};

function isApplicationStatus(value: string): value is ApplicationStatus {
    return Object.prototype.hasOwnProperty.call(statusStyles, value);
}

function getStatusStyle(status: string): string {
    return isApplicationStatus(status)
        ? statusStyles[status]
        : "text-[var(--text-secondary,var(--color-gray-600))] bg-[var(--surface-subtle,var(--color-gray-100))]";
}

export default function ApplicationsTableRow({ applicationData }: { applicationData: Application }) {
    return (
        <Modal>
            <ApplicationRow applicationData={applicationData} />
        </Modal>
    );
}

function ApplicationRow({ applicationData }: { applicationData: Application }) {
    const { open } = useModal();
    const { timeFormat } = useSettings();

    return (
        <tr
            className="cursor-pointer"
            onDoubleClick={(event) => {
                if (
                    event.target instanceof Element &&
                    event.target.closest("button, a, input, select, textarea, dialog")
                ) {
                    return;
                }
                open("edit-application");
            }}
        >
            <th scope="row">
                <div className="flex items-center gap-3">
                    <span
                        className="grid place-items-center w-11 h-11 shrink-0 [border:1px_solid_#00000004] rounded-[9px] text-[24px] font-[650]"
                        aria-hidden="true"
                    >
                        {applicationData.companyName.charAt(0)}
                    </span>

                    <div className="grid gap-[6px] text-[14px] text-[var(--text-secondary,#52637d)] [&_strong]:text-[var(--ink)] [&_strong]:text-[16px] [&_strong]:font-semibold">
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

            <td className="text-[var(--text-primary,#33465f)] text-[16px]">{applicationData.location}</td>

            <td className="text-[var(--text-primary,#33465f)] text-[16px]">{applicationData.workMode}</td>

            <td className="text-[var(--text-primary,#33465f)] text-[16px]">{applicationData.employmentType}</td>

            <td className="text-[var(--text-secondary,#42536d)] text-[16px] tabular-nums">
                <time dateTime={applicationData.dateApplied ?? undefined}>
                    {applicationData.dateApplied ?? "No date"}
                </time>
            </td>

            <td>
                <div className="grid gap-[6px] text-[14px] text-[var(--text-secondary,#52637d)]">
                    {applicationData.interviewDate && (
                        <span className="text-[var(--purple-text,#7957b0)] text-[16px]">
                            Interview:{" "}
                            <time
                                dateTime={`${applicationData.interviewDate}${applicationData.interviewTime ? `T${applicationData.interviewTime}` : ""}`}
                            >
                                {applicationData.interviewDate}
                                {applicationData.interviewTime &&
                                    ` at ${formatCalendarTime(applicationData.interviewTime, timeFormat)}`}
                            </time>
                        </span>
                    )}
                    {applicationData.deadline && (
                        <span className="text-[var(--text-primary,#33465f)] text-[16px]">
                            Deadline: {applicationData.deadline}
                        </span>
                    )}
                </div>
                <div className="cursor-auto whitespace-normal">
                    <EditApplication applicationData={applicationData} />
                </div>
            </td>
        </tr>
    );
}
