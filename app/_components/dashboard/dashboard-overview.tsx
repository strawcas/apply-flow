"use client";

import { useState } from "react";
import Link from "next/link";
import type { applications as applicationsTable } from "@/drizzle/schema";
import Icon, { type IconName } from "./dashboard-icon";
import { applicationColors } from "./application-colors";

type Application = Pick<
    typeof applicationsTable.$inferSelect,
    "id" | "companyName" | "jobTitle" | "location" | "workMode" | "status" | "dateApplied"
>;

const statuses = ["Applied", "In review", "Interview", "Offer", "Rejected"];
const statusStyles: Record<string, { badge: string; bar: string }> = {
    Applied: { badge: "text-[#396ab6] bg-[#edf3ff]", bar: "bg-[#5c8ee6]" },
    "In review": { badge: "text-[#8b691e] bg-[#fff6e6]", bar: "bg-[#d5aa51]" },
    Interview: { badge: "text-[#7957b0] bg-[#f2edfc]", bar: "bg-[#9a7bcf]" },
    Offer: { badge: "text-[#347b52] bg-[#edf8f0]", bar: "bg-[#61a980]" },
    Rejected: { badge: "text-[#ab575b] bg-[#fdf0f1]", bar: "bg-[#ce858b]" },
};
const fallbackStyle = { badge: "text-[#52637d] bg-[#f0f3f7]", bar: "bg-[#94a3b8]" };
const companyColors = ["blue", "purple", "coral", "green", "ink", "amber"];
const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
});

function getStatusStyle(status: string) {
    return Object.hasOwn(statusStyles, status) ? statusStyles[status] : fallbackStyle;
}

export default function DashboardOverview({ applications }: { applications: Application[] }) {
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("");
    const allStatuses = [...new Set([...statuses, ...applications.map((application) => application.status)])];
    const statusCounts = new Map<string, number>();
    for (const application of applications) {
        statusCounts.set(application.status, (statusCounts.get(application.status) ?? 0) + 1);
    }
    const search = query.trim().toLowerCase();
    const filtered = applications.filter(
        (application) =>
            `${application.companyName} ${application.jobTitle}`.toLowerCase().includes(search) &&
            (!filter || application.status === filter),
    );
    const visible = filtered.slice(0, 6);
    const metrics: { label: string; value: number; icon: IconName; color: string }[] = [
        { label: "Total applications", value: applications.length, icon: "applications", color: "blue" },
        { label: "In review", value: statusCounts.get("In review") ?? 0, icon: "activity", color: "amber" },
        { label: "Interviews", value: statusCounts.get("Interview") ?? 0, icon: "calendar", color: "purple" },
        { label: "Offers", value: statusCounts.get("Offer") ?? 0, icon: "check", color: "green" },
    ];

    return (
        <div className="w-full min-w-0 text-[14px] leading-[1.5]">
            <header className="mb-8">
                <h1 className="m-0 text-[34px] font-semibold leading-[1.25] tracking-[-1px] max-[600px]:text-[28px]">
                    Dashboard
                </h1>
            </header>
            <div className="mb-7 grid grid-cols-4 gap-4 max-[1000px]:grid-cols-2 max-[600px]:gap-3">
                {metrics.map((metric) => (
                    <article
                        key={metric.label}
                        className="rounded-xl border border-solid border-[var(--line)] bg-white p-6 max-[600px]:p-4"
                    >
                        <div className="flex min-h-11 items-start justify-between gap-2">
                            <h2 className="m-0 text-[14px] font-medium text-[#52637d]">{metric.label}</h2>
                            <span
                                className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg max-[600px]:h-8 max-[600px]:w-8 ${applicationColors[metric.color]}`}
                            >
                                <Icon name={metric.icon} />
                            </span>
                        </div>
                        <p className="mb-0 mt-4 text-[36px] font-semibold leading-none tracking-[-1px] tabular-nums">
                            {metric.value}
                        </p>
                    </article>
                ))}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-6 max-[1200px]:grid-cols-1">
                <section
                    aria-labelledby="recent-applications-title"
                    className="min-w-0 overflow-hidden rounded-xl border border-solid border-[var(--line)] bg-white"
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 p-6 max-[600px]:p-4">
                        <h2 id="recent-applications-title" className="m-0 text-[18px] font-semibold tracking-[-0.3px]">
                            Recent applications
                        </h2>
                        <Link
                            href="/applications"
                            className="inline-flex min-h-9 items-center gap-2 font-medium text-[var(--accent)] hover:underline [&_svg]:h-4 [&_svg]:w-4"
                        >
                            View all <Icon name="arrow" />
                        </Link>
                    </div>
                    {applications.length > 0 && (
                        <div className="flex gap-3 px-6 pb-5 max-[600px]:flex-col max-[600px]:px-4">
                            <label className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-solid border-[var(--line)] px-3 text-[#77849a] focus-within:border-[#93b8ff] [&_svg]:shrink-0">
                                <Icon name="search" />
                                <input
                                    type="search"
                                    aria-label="Search applications"
                                    placeholder="Search company or role"
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    className="h-11 min-w-0 w-full border-0 bg-transparent p-0 text-[14px] text-[var(--ink)] placeholder:text-[#77849a]"
                                />
                            </label>
                            <select
                                aria-label="Filter applications by status"
                                value={filter}
                                onChange={(event) => setFilter(event.target.value)}
                                className="min-h-11 rounded-lg border border-solid border-[var(--line)] bg-white px-3 text-[14px] text-[#52637d]"
                            >
                                <option value="">All statuses</option>
                                {allStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                    {visible.length > 0 ? (
                        <div
                            className="overflow-x-auto overscroll-x-contain focus-visible:outline-offset-[-3px]"
                            role="region"
                            aria-label="Recent applications table"
                            tabIndex={0}
                        >
                            <table className="w-full min-w-[560px] border-collapse text-left [&_thead_th]:border-y [&_thead_th]:border-x-0 [&_thead_th]:border-solid [&_thead_th]:border-[var(--line)] [&_thead_th]:bg-[#fafbfd] [&_thead_th]:px-6 [&_thead_th]:py-3 [&_thead_th]:text-[12px] [&_thead_th]:font-medium [&_thead_th]:text-[#66758c] [&_tbody_th]:px-6 [&_tbody_th]:py-5 [&_td]:px-6 [&_td]:py-5 [&_tbody_tr+tr]:border-t [&_tbody_tr+tr]:border-solid [&_tbody_tr+tr]:border-[#f0f3f7]">
                                <caption className="sr-only">
                                    Applications ordered by date applied, newest first
                                </caption>
                                <thead>
                                    <tr>
                                        <th scope="col">Company &amp; role</th>
                                        <th scope="col">Status</th>
                                        <th scope="col" className="whitespace-nowrap">
                                            Date applied
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visible.map((application) => (
                                        <tr key={application.id} className="hover:bg-[#fbfcff]">
                                            <th scope="row" className="font-normal">
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        aria-hidden="true"
                                                        className={`grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-[20px] font-semibold ${applicationColors[companyColors[application.id % companyColors.length]]}`}
                                                    >
                                                        {application.companyName.trim().charAt(0).toUpperCase()}
                                                    </span>
                                                    <div className="min-w-0 max-w-[320px] break-words">
                                                        <strong className="block text-[15px] font-semibold">
                                                            {application.companyName}
                                                        </strong>
                                                        <span className="mt-1 block text-[13px] text-[#52637d]">
                                                            {application.jobTitle}
                                                        </span>
                                                        <span className="mt-1 block text-[12px] text-[#77849a]">
                                                            {[
                                                                ...new Set(
                                                                    [application.location, application.workMode].filter(
                                                                        Boolean,
                                                                    ),
                                                                ),
                                                            ].join(" · ")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </th>
                                            <td>
                                                <span
                                                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-[12px] font-medium ${getStatusStyle(application.status).badge}`}
                                                >
                                                    <span
                                                        aria-hidden="true"
                                                        className="h-1.5 w-1.5 rounded-full bg-current"
                                                    />
                                                    {application.status}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap text-[13px] text-[#66758c] tabular-nums">
                                                {application.dateApplied ? (
                                                    <time dateTime={application.dateApplied}>
                                                        {dateFormatter.format(
                                                            new Date(`${application.dateApplied}T00:00:00Z`),
                                                        )}
                                                    </time>
                                                ) : (
                                                    <span aria-label="No application date">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 px-6 py-14 text-center">
                            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#edf3ff] text-[#5680c7]">
                                <Icon name={applications.length ? "search" : "applications"} />
                            </span>
                            <p className="m-0 font-medium">
                                {applications.length ? "No matching applications" : "No applications yet"}
                            </p>
                            {applications.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setQuery("");
                                        setFilter("");
                                    }}
                                    className="min-h-10 rounded-lg border border-solid border-[var(--line)] bg-white px-4 text-[var(--accent)] hover:bg-[#f7f9fc]"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                    <div
                        role="status"
                        className="border-x-0 border-b-0 border-t border-solid border-[var(--line)] px-6 py-4 text-[12px] text-[#66758c] max-[600px]:px-4"
                    >
                        Showing {visible.length} of {filtered.length} {search || filter ? "matching " : ""}applications
                    </div>
                </section>
                <section
                    aria-labelledby="application-status-title"
                    className="rounded-xl border border-solid border-[var(--line)] bg-white p-6 max-[600px]:p-4"
                >
                    <h2 id="application-status-title" className="m-0 text-[18px] font-semibold tracking-[-0.3px]">
                        Application status
                    </h2>
                    <div aria-hidden="true" className="mb-6 mt-6 flex h-2 overflow-hidden rounded-full bg-[#f0f3f7]">
                        {allStatuses.map((status) => (
                            <span
                                key={status}
                                className={getStatusStyle(status).bar}
                                style={{
                                    width: `${applications.length ? ((statusCounts.get(status) ?? 0) / applications.length) * 100 : 0}%`,
                                }}
                            />
                        ))}
                    </div>
                    <ul className="m-0 grid list-none gap-2 p-0">
                        {allStatuses.map((status) => (
                            <li key={status}>
                                <button
                                    type="button"
                                    aria-pressed={filter === status}
                                    aria-label={`Filter ${status} applications`}
                                    onClick={() => setFilter(filter === status ? "" : status)}
                                    className={`flex min-h-11 w-full items-center gap-3 rounded-lg border-0 px-3 py-2 text-left text-[14px] ${filter === status ? "bg-[#edf3ff] text-[#3567bc]" : "bg-transparent text-[#52637d] hover:bg-[#f7f9fc]"}`}
                                >
                                    <span
                                        aria-hidden="true"
                                        className={`h-2 w-2 shrink-0 rounded-full ${getStatusStyle(status).bar}`}
                                    />
                                    <span>{status}</span>
                                    <span className="ml-auto font-semibold tabular-nums">
                                        {statusCounts.get(status) ?? 0}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
}
