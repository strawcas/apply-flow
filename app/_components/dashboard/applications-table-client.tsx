"use client";

import { useState } from "react";
import type { applications as applicationsTable } from "@/drizzle/schema";
import { applicationStatuses } from "@/app/_lib/application-status";
import { applicationSortOptions, filterAndSortApplications, type ApplicationSort } from "@/app/_lib/application-list";
import Icon from "./dashboard-icon";
import ApplicationsTableRow from "./ApplicationsTableRow";
import styles from "./applications-table.module.css";

type Application = typeof applicationsTable.$inferSelect;

export default function ApplicationsTableClient({ applications }: { applications: Application[] }) {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("");
    const [sort, setSort] = useState<ApplicationSort>("newest");
    const statuses = [...new Set([...applicationStatuses, ...applications.map((application) => application.status)])];
    const visible = filterAndSortApplications(applications, { query, status, sort });
    const hasFilters = Boolean(query.trim() || status);

    function clearFilters() {
        setQuery("");
        setStatus("");
    }

    return (
        <section
            className={`${styles.panel} overflow-hidden [border:1px_solid_var(--line)] rounded-[10px] bg-[var(--surface,#fff)]`}
            aria-labelledby="applications-title"
        >
            <div className="flex items-center gap-[9px] px-6 pb-5 pt-6 max-[600px]:px-4 max-[600px]:pt-5">
                <h2 id="applications-title" className="m-0 text-[20px] font-semibold tracking-[-0.3px]">
                    All applications
                </h2>
                <span className="rounded-[5px] bg-[var(--blue-soft,#edf3ff)] px-[10px] py-[3px] text-[14px] font-semibold text-[var(--blue-text,#3567bc)]">
                    {applications.length}
                </span>
            </div>

            <div className={styles.toolbar}>
                <label className={styles.search}>
                    <Icon name="search" />
                    <input
                        type="search"
                        aria-label="Search applications"
                        placeholder="Search by company or role…"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        className={styles.searchInput}
                    />
                </label>
                <div className={styles.selectControl}>
                    <select
                        aria-label="Filter by status"
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className={styles.select}
                    >
                        <option value="">All statuses</option>
                        {statuses.map((value) => (
                            <option key={value} value={value}>
                                {value}
                            </option>
                        ))}
                    </select>
                    <span className={styles.chevron}>
                        <Icon name="chevron-down" />
                    </span>
                </div>
                <div className={`${styles.selectControl} ${styles.sortControl}`}>
                    <span className={styles.sortIcon}>
                        <Icon name="sort" />
                    </span>
                    <select
                        aria-label="Sort applications"
                        value={sort}
                        onChange={(event) => setSort(event.target.value as ApplicationSort)}
                        className={styles.select}
                    >
                        {applicationSortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <span className={styles.chevron}>
                        <Icon name="chevron-down" />
                    </span>
                </div>
            </div>

            {visible.length > 0 ? (
                <div
                    className="relative overflow-x-auto overscroll-x-contain focus-visible:outline-offset-[-3px]"
                    role="region"
                    aria-label="Applications table"
                    tabIndex={0}
                >
                    <table className="w-full min-w-350 border-collapse text-left whitespace-nowrap [&_thead_th]:[border-block:1px_solid_var(--line)] [&_thead_th]:bg-[var(--surface-subtle,#fafbfd)] [&_thead_th]:text-[var(--text-secondary,#42536d)] [&_thead_th]:text-[14px] [&_thead_th]:font-semibold [&_thead_th]:py-[18px] [&_thead_th]:px-5 [&_tbody_th]:h-24 [&_tbody_th]:[border-bottom:1px_solid_var(--border,#edf1f6)] [&_tbody_th]:font-normal [&_tbody_th]:p-5 [&_td]:h-24 [&_td]:[border-bottom:1px_solid_var(--border,#edf1f6)] [&_td]:font-normal [&_td]:p-5 [&_tr_>_:first-child]:pl-6 [&_tr_>_:last-child]:pr-5 [&_tbody_tr:last-child_>_*]:[border-bottom:0] [&_tbody_tr:hover]:bg-[var(--surface-hover,#fbfcff)]">
                        <caption className="sr-only">Job applications and their status</caption>
                        <thead>
                            <tr>
                                <th scope="col">Company &amp; role</th>
                                <th scope="col">Status</th>
                                <th scope="col">Location</th>
                                <th scope="col">Work arrangement</th>
                                <th scope="col">Employment type</th>
                                <th scope="col">Date applied</th>
                                <th scope="col">Next step</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((application) => (
                                <ApplicationsTableRow applicationData={application} key={application.id} />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-3 border-x-0 border-b-0 border-t border-solid border-[var(--line)] px-6 py-12 text-center">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-[var(--blue-soft,#edf3ff)] text-[var(--blue-text,#3567bc)]">
                        <Icon name={applications.length ? "search" : "applications"} />
                    </span>
                    <p className="m-0 font-medium">
                        {applications.length ? "No matching applications" : "No applications yet"}
                    </p>
                    <p className="m-0 text-[14px] text-[var(--text-secondary,#52637d)]">
                        {applications.length
                            ? "Try a different search or status."
                            : "Add an application to start tracking your job search."}
                    </p>
                    {hasFilters && (
                        <button type="button" onClick={clearFilters} className={styles.clearButton}>
                            Clear filters
                        </button>
                    )}
                </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-3 border-x-0 border-b-0 border-t border-solid border-[var(--line)] px-6 py-4 text-[14px] text-[var(--text-secondary,#52637d)] max-[600px]:px-4">
                <p role="status" aria-live="polite" aria-atomic="true" className="m-0">
                    Showing <strong className="font-medium">{visible.length}</strong> of{" "}
                    <strong className="font-medium">{applications.length}</strong> applications
                </p>
                {hasFilters && visible.length > 0 && (
                    <button type="button" onClick={clearFilters} className={styles.clearButton}>
                        Clear filters
                    </button>
                )}
            </footer>
        </section>
    );
}
