"use client";
import { useState, type FormEvent } from "react";
import Icon, { type IconName } from "./dashboard-icon";
import styles from "./dashboard.module.css";

type Application = { company: string; role: string; location: string; status: string; date: string; color: string };
const initialApplications: Application[] = [
    {
        company: "Linear",
        role: "Product Designer",
        location: "Remote",
        status: "Interview",
        date: "Sep 18, 2026",
        color: "purple",
    },
    {
        company: "Notion",
        role: "Frontend Developer",
        location: "San Francisco, CA",
        status: "Applied",
        date: "Sep 17, 2026",
        color: "ink",
    },
    {
        company: "Figma",
        role: "UX Designer",
        location: "Remote",
        status: "In review",
        date: "Sep 16, 2026",
        color: "coral",
    },
    {
        company: "Spotify",
        role: "Product Designer",
        location: "New York, NY",
        status: "Offer",
        date: "Sep 15, 2026",
        color: "green",
    },
    {
        company: "Stripe",
        role: "Frontend Engineer",
        location: "Remote",
        status: "Applied",
        date: "Sep 14, 2026",
        color: "purple",
    },
];
const statusClass: Record<string, string> = {
    Applied: "applied",
    "In review": "review",
    Interview: "interview",
    Offer: "offer",
};
export default function DashboardOverview() {
    const [applications, setApplications] = useState(initialApplications);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("All applications");
    const [adding, setAdding] = useState(false);
    const [announcement, setAnnouncement] = useState("");
    const filtered = applications.filter(
        (item) =>
            `${item.company} ${item.role}`.toLowerCase().includes(query.toLowerCase()) &&
            (filter === "All applications" || item.status === filter),
    );
    const metrics: { label: string; value: number; note: string; icon: IconName; color: string }[] = [
        {
            label: "Total applications",
            value: applications.length,
            note: "Every application is a step forward",
            icon: "applications",
            color: "blue",
        },
        {
            label: "In review",
            value: applications.filter((a) => a.status === "In review").length,
            note: "Making a first impression",
            icon: "activity",
            color: "purple",
        },
        {
            label: "Interviews",
            value: applications.filter((a) => a.status === "Interview").length,
            note: "Your chance to stand out",
            icon: "overview",
            color: "amber",
        },
        {
            label: "Offers received",
            value: applications.filter((a) => a.status === "Offer").length,
            note: "Good things are happening",
            icon: "check",
            color: "green",
        },
    ];
    function addApplication(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const company = String(data.get("company") ?? "").trim();
        const role = String(data.get("role") ?? "").trim();
        if (!company || !role) return;
        setApplications((current) => [
            {
                company,
                role,
                location: "Remote",
                status: "Applied",
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                color: "blue",
            },
            ...current,
        ]);
        setQuery("");
        setFilter("All applications");
        setAdding(false);
        setAnnouncement(`${company} application added to this preview.`);
    }
    return (
        <>
            <section id="overview" className={styles.heading}>
                <div>
                    <p className={styles.eyebrow}>YOUR NEXT CHAPTER</p>
                    <h1>Let’s move your career forward.</h1>
                    <p>Everything you need to keep your job search on track.</p>
                </div>
                <button
                    className={styles.primaryButton}
                    onClick={() => setAdding(!adding)}
                    aria-expanded={adding}
                    aria-controls="new-application"
                >
                    <Icon name="plus" /> Add application
                </button>
            </section>
            {adding && (
                <form id="new-application" className={styles.addForm} onSubmit={addApplication}>
                    <label>
                        Company
                        <input name="company" required maxLength={80} autoFocus placeholder="e.g. Figma" />
                    </label>
                    <label>
                        Job title
                        <input name="role" required maxLength={100} placeholder="e.g. Product Designer" />
                    </label>
                    <button className={styles.primaryButton} type="submit">
                        Add to preview
                    </button>
                    <button className={styles.secondaryButton} type="button" onClick={() => setAdding(false)}>
                        Cancel
                    </button>
                    <p>Preview only. Added applications reset when you reload.</p>
                </form>
            )}
            <span className={styles.srOnly} role="status">
                {announcement}
            </span>
            <div className={styles.metrics}>
                {metrics.map((metric) => (
                    <article className={styles.metric} key={metric.label}>
                        <div className={styles.metricHeader}>
                            <span>{metric.label}</span>
                            <span className={`${styles.metricIcon} ${styles[metric.color]}`}>
                                <Icon name={metric.icon} />
                            </span>
                        </div>
                        <strong>{String(metric.value).padStart(2, "0")}</strong>
                        <p>{metric.note}</p>
                    </article>
                ))}
            </div>
            <div className={styles.contentGrid}>
                <section id="applications" className={styles.panel}>
                    <div className={styles.panelHeading}>
                        <div>
                            <h2>
                                Your applications <span className={styles.count}>{applications.length}</span>
                            </h2>
                            <p>A little organization. A lot more possibility.</p>
                        </div>
                        <span className={styles.smallLabel}>SAMPLE DATA</span>
                    </div>
                    <div className={styles.tableTools}>
                        <label className={styles.search}>
                            <Icon name="search" />
                            <input
                                aria-label="Search applications"
                                placeholder="Search company or role…"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </label>
                        <select
                            aria-label="Filter applications by status"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            {["All applications", "Applied", "In review", "Interview", "Offer"].map((status) => (
                                <option key={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.tableScroll}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th scope="col">Company & role</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Date applied</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((item, index) => (
                                    <tr key={`${item.company}-${index}`}>
                                        <td>
                                            <div className={styles.company}>
                                                <span className={`${styles.companyLogo} ${styles[item.color]}`}>
                                                    {item.company.slice(0, 1)}
                                                </span>
                                                <div>
                                                    <strong>{item.company}</strong>
                                                    <span>{item.role}</span>
                                                    <small>{item.location}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`${styles.status} ${styles[statusClass[item.status]]}`}>
                                                <i />
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className={styles.date}>{item.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className={styles.empty}>
                                <Icon name="search" />
                                <h3>No applications found</h3>
                                <p>Try another company, role, or status.</p>
                                <button
                                    className={styles.secondaryButton}
                                    onClick={() => {
                                        setQuery("");
                                        setFilter("All applications");
                                    }}
                                >
                                    Clear filters
                                </button>
                            </div>
                        )}
                    </div>
                    <div className={styles.tableFooter}>
                        Showing {filtered.length} of {applications.length} applications<span>One step closer.</span>
                    </div>
                </section>
                <div className={styles.rightRail}>
                    <section id="goals" className={styles.goalCard}>
                        <div className={styles.goalTitle}>
                            <span className={styles.goalIcon}>
                                <Icon name="goal" />
                            </span>
                            <span>STAY CONSISTENT</span>
                        </div>
                        <h2>A little progress, every day.</h2>
                        <p>Your weekly application goal is within reach. You’ve got this.</p>
                        <div className={styles.goalNumbers}>
                            <strong>
                                {Math.min(applications.length, 8)} <span>/ 8 applications</span>
                            </strong>
                            <span>{Math.round(Math.min(applications.length / 8, 1) * 100)}%</span>
                        </div>
                        <progress
                            max={8}
                            value={Math.min(applications.length, 8)}
                            aria-label="Weekly application goal"
                        />
                        <p className={styles.goalFootnote}>
                            {applications.length >= 8
                                ? "Goal reached. Take a moment to celebrate!"
                                : `${8 - applications.length} more to reach your sample weekly goal`}
                        </p>
                    </section>
                    <section id="activity" className={`${styles.panel} ${styles.activityPanel}`}>
                        <h2>Recent activity</h2>
                        <p className={styles.activitySubtitle}>The small wins add up.</p>
                        <ol className={styles.timeline}>
                            <li>
                                <span className={`${styles.timelineDot} ${styles.green}`}>
                                    <Icon name="check" />
                                </span>
                                <div>
                                    <strong>An offer from Spotify</strong>
                                    <p>Your next chapter looks promising.</p>
                                    <time dateTime="2026-09-19">Sep 19 · Sample activity</time>
                                </div>
                            </li>
                            <li>
                                <span className={`${styles.timelineDot} ${styles.purple}`}>
                                    <Icon name="overview" />
                                </span>
                                <div>
                                    <strong>Interview with Linear</strong>
                                    <p>Time to make a great impression.</p>
                                    <time dateTime="2026-09-18">Sep 18 · Sample activity</time>
                                </div>
                            </li>
                            <li>
                                <span className={`${styles.timelineDot} ${styles.blue}`}>
                                    <Icon name="applications" />
                                </span>
                                <div>
                                    <strong>Applied to Notion</strong>
                                    <p>Another opportunity in motion.</p>
                                    <time dateTime="2026-09-17">Sep 17 · Sample activity</time>
                                </div>
                            </li>
                        </ol>
                    </section>
                </div>
            </div>
            <footer className={styles.footer}>
                Built for your next big step.<span>ApplyFlow · Your job search, organized.</span>
            </footer>
        </>
    );
}
