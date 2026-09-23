import Icon from "./dashboard-icon";
import dashboard from "./dashboard.module.css";
import styles from "./applications-table.module.css";

type ApplicationStatus = "Applied" | "In review" | "Interview" | "Offer" | "Rejected";

type Application = {
    id: string;
    company: string;
    role: string;
    location: string;
    workType: string;
    status: ApplicationStatus;
    appliedAt: string;
    appliedLabel: string;
    nextStep: string;
    nextStepDetail: string;
    color: "purple" | "ink" | "coral" | "green" | "blue" | "amber";
};

// Design-only sample data. Replace with your applications when connecting the page.
const placeholderApplications: Application[] = [
    {
        id: "sample-linear",
        company: "Linear",
        role: "Product Designer",
        location: "Remote",
        workType: "Full-time",
        status: "Interview",
        appliedAt: "2026-09-18",
        appliedLabel: "Sep 18, 2026",
        nextStep: "Design interview",
        nextStepDetail: "Sep 25 · 10:00 AM",
        color: "purple",
    },
    {
        id: "sample-notion",
        company: "Notion",
        role: "Frontend Developer",
        location: "San Francisco, CA",
        workType: "Hybrid · Full-time",
        status: "Applied",
        appliedAt: "2026-09-17",
        appliedLabel: "Sep 17, 2026",
        nextStep: "Awaiting response",
        nextStepDetail: "Application submitted",
        color: "ink",
    },
    {
        id: "sample-figma",
        company: "Figma",
        role: "UX Designer",
        location: "Remote",
        workType: "Full-time",
        status: "In review",
        appliedAt: "2026-09-16",
        appliedLabel: "Sep 16, 2026",
        nextStep: "Portfolio review",
        nextStepDetail: "With the hiring team",
        color: "coral",
    },
    {
        id: "sample-spotify",
        company: "Spotify",
        role: "Product Designer",
        location: "New York, NY",
        workType: "Hybrid · Full-time",
        status: "Offer",
        appliedAt: "2026-09-15",
        appliedLabel: "Sep 15, 2026",
        nextStep: "Review offer",
        nextStepDetail: "Respond by Sep 28",
        color: "green",
    },
    {
        id: "sample-stripe",
        company: "Stripe",
        role: "Frontend Engineer",
        location: "Remote",
        workType: "Full-time",
        status: "Applied",
        appliedAt: "2026-09-14",
        appliedLabel: "Sep 14, 2026",
        nextStep: "Awaiting response",
        nextStepDetail: "Application submitted",
        color: "purple",
    },
    {
        id: "sample-dropbox",
        company: "Dropbox",
        role: "Design Engineer",
        location: "Remote",
        workType: "Full-time",
        status: "Interview",
        appliedAt: "2026-09-12",
        appliedLabel: "Sep 12, 2026",
        nextStep: "Introductory call",
        nextStepDetail: "Sep 24 · 2:30 PM",
        color: "blue",
    },
    {
        id: "sample-airbnb",
        company: "Airbnb",
        role: "UX Researcher",
        location: "San Francisco, CA",
        workType: "On-site · Full-time",
        status: "Rejected",
        appliedAt: "2026-09-10",
        appliedLabel: "Sep 10, 2026",
        nextStep: "Application closed",
        nextStepDetail: "Keep moving forward",
        color: "coral",
    },
    {
        id: "sample-miro",
        company: "Miro",
        role: "Product Designer",
        location: "Remote",
        workType: "Contract",
        status: "In review",
        appliedAt: "2026-09-09",
        appliedLabel: "Sep 9, 2026",
        nextStep: "Resume review",
        nextStepDetail: "With the hiring team",
        color: "amber",
    },
];

const statusStyles: Record<ApplicationStatus, string> = {
    Applied: styles.applied,
    "In review": styles.review,
    Interview: styles.interview,
    Offer: styles.offer,
    Rejected: styles.rejected,
};

export default function ApplicationsTable() {
    return (
        <div className={styles.page}>
            <header className={dashboard.heading}>
                <div>
                    <p className={dashboard.eyebrow}>YOUR NEXT OPPORTUNITY</p>
                    <h1>Applications</h1>
                    <p>Every opportunity, from the first application to the final offer.</p>
                </div>
                {/* Controls are intentionally disabled until application logic is added. */}
                <button type="button" className={dashboard.primaryButton} disabled title="Design preview">
                    <Icon name="plus" /> Add application
                </button>
            </header>

            <section className={styles.panel} aria-labelledby="applications-title">
                <div className={styles.panelHeading}>
                    <div className={styles.titleGroup}>
                        <h2 id="applications-title">All applications</h2>
                        <span className={styles.count}>{placeholderApplications.length}</span>
                    </div>
                    <span className={styles.sampleLabel}>Sample data</span>
                </div>

                <div className={styles.toolbar}>
                    <label className={styles.search}>
                        <Icon name="search" />
                        <input
                            type="search"
                            aria-label="Search applications"
                            placeholder="Search by company or role…"
                            disabled
                        />
                    </label>
                    <div className={styles.filters}>
                        <select aria-label="Filter by status" defaultValue="all" disabled>
                            <option value="all">All statuses</option>
                            {Object.keys(statusStyles).map((status) => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <button type="button" className={styles.sortButton} disabled>
                            <Icon name="sort" /> Newest first
                        </button>
                    </div>
                </div>

                <div className={styles.tableScroll} role="region" aria-label="Applications table" tabIndex={0}>
                    <table className={styles.table}>
                        <caption className={dashboard.srOnly}>Sample job applications and their progress</caption>
                        <thead>
                            <tr>
                                <th scope="col">Company &amp; role</th>
                                <th scope="col">Status</th>
                                <th scope="col">Location</th>
                                <th scope="col">Date applied</th>
                                <th scope="col">Next step</th>
                                <th scope="col"><span className={dashboard.srOnly}>Actions</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {placeholderApplications.map((application) => (
                                <tr key={application.id}>
                                    <th scope="row">
                                        <div className={styles.company}>
                                            <span className={`${styles.companyLogo} ${dashboard[application.color]}`} aria-hidden="true">
                                                {application.company.charAt(0)}
                                            </span>
                                            <div className={styles.cellStack}>
                                                <strong>{application.company}</strong>
                                                <span>{application.role}</span>
                                            </div>
                                        </div>
                                    </th>
                                    <td>
                                        <span className={`${styles.status} ${statusStyles[application.status]}`}>
                                            <span className={styles.statusDot} aria-hidden="true" />
                                            {application.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.cellStack}>
                                            <span className={styles.cellPrimary}>{application.location}</span>
                                            <span>{application.workType}</span>
                                        </div>
                                    </td>
                                    <td className={styles.date}>
                                        <time dateTime={application.appliedAt}>{application.appliedLabel}</time>
                                    </td>
                                    <td>
                                        <div className={styles.cellStack}>
                                            <span className={styles.cellPrimary}>{application.nextStep}</span>
                                            <span>{application.nextStepDetail}</span>
                                        </div>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <button
                                            type="button"
                                            className={styles.iconButton}
                                            aria-label={`More actions for ${application.company} ${application.role}`}
                                            disabled
                                        >
                                            <Icon name="more" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <footer className={styles.tableFooter}>
                    <p>Showing <strong>1–{placeholderApplications.length}</strong> of <strong>{placeholderApplications.length}</strong> applications</p>
                    <nav className={styles.pagination} aria-label="Application pages">
                        <button type="button" className={styles.iconButton} aria-label="Previous page" disabled>
                            <Icon name="chevron-left" />
                        </button>
                        <button type="button" className={styles.currentPage} aria-label="Page 1" aria-current="page" disabled>1</button>
                        <button type="button" className={styles.iconButton} aria-label="Next page" disabled>
                            <Icon name="chevron-right" />
                        </button>
                    </nav>
                </footer>
            </section>
            <p className={styles.footnote}>One application at a time. One step closer.</p>
        </div>
    );
}
