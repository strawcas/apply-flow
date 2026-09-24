"use client";
import { useState, type FormEvent } from "react";
import Icon, { type IconName } from "./dashboard-icon";
import { applicationColors } from "@/app/_components/dashboard/application-colors";

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
const statusClasses: Record<string, string> = {
    Applied: "bg-[#edf3ff] text-[#5680c7]",
    "In review": "bg-[#fff6e6] text-[#af8737]",
    Interview: "bg-[#f2edfc] text-[#8a6ac2]",
    Offer: "bg-[#edf8f0] text-[#4a9669]",
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
            <section
                id="overview"
                className="flex justify-between items-center gap-5 mb-[30px] [&_h1]:text-[clamp(24px,_2.2vw,_33px)] [&_h1]:font-[550] [&_h1]:tracking-[-1.2px] [&_h1]:leading-[1.3] [&_h1]:m-0 [&_p]:mt-[10px] [&_p]:mb-0 [&_p]:text-[var(--muted)] [&_p]:text-[12px] [&_p]:leading-[1.6] [&_p]:mx-0 min-[1600px]:mb-[38px] max-[800px]:items-start max-[800px]:flex-col max-[600px]:[&_h1]:text-[28px] max-[600px]:mb-6"
            >
                <div>
                    <p className="text-[#7186a7]! text-[9px]! tracking-[1.8px] font-semibold mt-0! mb-[11px]! mx-0!">
                        YOUR NEXT CHAPTER
                    </p>
                    <h1>Let’s move your career forward.</h1>
                    <p>Everything you need to keep your job search on track.</p>
                </div>
                <button
                    className="min-h-[42px] inline-flex justify-center items-center gap-[9px] [border:1px_solid_transparent] rounded-[7px] whitespace-nowrap text-[11px]! font-medium! bg-[var(--accent)] text-white shadow-[0_3px_6px_#2563eb16] py-[11px] px-[17px] hover:bg-[#1d4ed8] [&_svg]:w-4 [&_svg]:h-4"
                    onClick={() => setAdding(!adding)}
                    aria-expanded={adding}
                    aria-controls="new-application"
                >
                    <Icon name="plus" /> Add application
                </button>
            </section>
            {adding && (
                <form
                    id="new-application"
                    className="flex flex-wrap items-end gap-3 bg-white [border:1px_solid_var(--line)] rounded-[10px] mb-6 p-5 [&_label]:flex-1 [&_label]:min-w-[150px] [&_label]:text-[11px] [&_input]:block [&_input]:w-full [&_input]:mt-2 [&_input]:[border:1px_solid_#dce4ee] [&_input]:rounded-[6px] [&_input]:h-[42px] [&_input]:text-[var(--ink)] [&_input]:p-[10px] [&_p]:w-full [&_p]:text-[10px] [&_p]:text-[var(--muted)] [&_p]:m-0"
                    onSubmit={addApplication}
                >
                    <label>
                        Company
                        <input name="company" required maxLength={80} autoFocus placeholder="e.g. Figma" />
                    </label>
                    <label>
                        Job title
                        <input name="role" required maxLength={100} placeholder="e.g. Product Designer" />
                    </label>
                    <button
                        className="min-h-[42px] inline-flex justify-center items-center gap-[9px] [border:1px_solid_transparent] rounded-[7px] whitespace-nowrap text-[11px]! font-medium! bg-[var(--accent)] text-white shadow-[0_3px_6px_#2563eb16] py-[11px] px-[17px] hover:bg-[#1d4ed8] [&_svg]:w-4 [&_svg]:h-4"
                        type="submit"
                    >
                        Add to preview
                    </button>
                    <button
                        className="min-h-[42px] inline-flex justify-center items-center gap-[9px] [border:1px_solid_var(--line)] rounded-[7px] whitespace-nowrap text-[11px]! font-medium! bg-white text-[var(--ink)] py-[11px] px-[17px]"
                        type="button"
                        onClick={() => setAdding(false)}
                    >
                        Cancel
                    </button>
                    <p>Preview only. Added applications reset when you reload.</p>
                </form>
            )}
            <span
                className="absolute w-[1px] h-[1px] overflow-hidden [clip-path:inset(50%)] whitespace-nowrap"
                role="status"
            >
                {announcement}
            </span>
            <div className="grid grid-cols-4 gap-[17px] mb-[27px] max-[800px]:grid-cols-2 max-[600px]:gap-3">
                {metrics.map((metric) => (
                    <article
                        className="[border:1px_solid_var(--line)] rounded-[10px] bg-white p-5 [&_>_strong]:block [&_>_strong]:mt-[10px] [&_>_strong]:mb-2 [&_>_strong]:text-[32px] [&_>_strong]:font-[550] [&_>_strong]:tracking-[-1px] [&_>_strong]:mx-0 [&_>_p]:text-[10px] [&_>_p]:leading-[1.6] [&_>_p]:text-[var(--muted)] [&_>_p]:m-0 min-[1600px]:p-[25px] max-[1200px]:p-4 max-[600px]:p-[15px] max-[600px]:[&_>_p]:text-[9px]"
                        key={metric.label}
                    >
                        <div className="flex items-center justify-between gap-2 text-[#66758c] text-[11px] max-[1200px]:text-[10px] max-[600px]:items-start">
                            <span>{metric.label}</span>
                            <span
                                className={`grid place-items-center w-[33px] h-[33px] rounded-[8px] [&_svg]:w-[17px] [&_svg]:h-[17px] max-[600px]:w-[27px] max-[600px]:h-[27px] max-[600px]:shrink-0 ${applicationColors[metric.color]}`}
                            >
                                <Icon name={metric.icon} />
                            </span>
                        </div>
                        <strong>{String(metric.value).padStart(2, "0")}</strong>
                        <p>{metric.note}</p>
                    </article>
                ))}
            </div>
            <div className="grid grid-cols-[minmax(0,_1fr)_292px] gap-6 items-start max-[1200px]:grid-cols-[minmax(0,_1fr)]">
                <section
                    id="applications"
                    className="bg-white [border:1px_solid_var(--line)] rounded-[10px] overflow-hidden [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:tracking-[-0.3px] [&_h2]:m-0"
                >
                    <div className="pt-6 pb-5 flex items-center justify-between gap-3 px-[23px] [&_p]:mt-2 [&_p]:mb-0 [&_p]:text-[var(--muted)] [&_p]:text-[10px] [&_p]:leading-[1.5] [&_p]:mx-0 max-[600px]:py-5 max-[600px]:px-[17px]">
                        <div>
                            <h2>
                                Your applications{" "}
                                <span className="inline-block ml-[7px] rounded-[5px] text-[#647792] bg-[#f2f5f9] text-[10px] align-middle py-[3px] px-[7px]">
                                    {applications.length}
                                </span>
                            </h2>
                            <p>A little organization. A lot more possibility.</p>
                        </div>
                        <span className="text-[8px] text-[#97a3b5] tracking-[1px] whitespace-nowrap max-[1200px]:hidden">
                            SAMPLE DATA
                        </span>
                    </div>
                    <div className="flex gap-3 pt-0 pb-5 px-[23px] [&_select]:bg-white [&_select]:[border:1px_solid_var(--line)] [&_select]:rounded-[6px] [&_select]:text-[10px] [&_select]:text-[#64748b] [&_select]:min-h-[38px] [&_select]:py-0 [&_select]:px-[10px] max-[600px]:gap-2 max-[600px]:px-[17px] max-[600px]:[&_select]:max-w-[125px]">
                        <label className="flex items-center flex-1 min-w-0 gap-[9px] [border:1px_solid_var(--line)] rounded-[6px] py-0 px-[11px] [&_svg]:w-[15px] [&_svg]:shrink-0 [&_svg]:text-[#97a3b5] [&_input]:w-full [&_input]:min-w-0 [&_input]:h-[37px] [&_input]:[border:0] [&_input]:bg-transparent [&_input]:text-[10px] [&_input]:text-[var(--ink)] [&_input]:p-0 [&_input::placeholder]:text-[#8995a8]">
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
                    <div className="overflow-x-auto">
                        <table className="border-collapse w-full text-left whitespace-nowrap [&_th]:text-[10px] [&_th]:font-medium [&_th]:text-[#8b97a9] [&_th]:bg-[#fafbfd] [&_th]:[border-block:1px_solid_var(--line)] [&_th]:py-[13px] [&_th]:px-4 [&_th:first-child]:pl-[23px] [&_td:first-child]:pl-[23px] [&_th:last-child]:pr-[23px] [&_td:last-child]:pr-[23px] [&_td]:[border-bottom:1px_solid_#f0f3f7] [&_td]:py-5 [&_td]:px-4 [&_tbody_tr:last-child_td]:[border-bottom:0] [&_tbody_tr:hover]:bg-[#fbfcff] max-[600px]:min-w-[510px]">
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
                                            <div className="flex items-center gap-3 [&_strong]:block [&_strong]:font-[550] [&_strong]:text-[12px] [&_div_>_span]:block [&_div_>_span]:mt-[5px] [&_div_>_span]:text-[#6d7b91] [&_div_>_span]:text-[10px] [&_small]:block [&_small]:mt-1 [&_small]:text-[#98a2b2] [&_small]:text-[9px]">
                                                <span
                                                    className={`w-[37px] h-[37px] [border:1px_solid_#00000004] rounded-[9px] grid place-items-center text-[21px] font-[650] shrink-0 ${applicationColors[item.color]}`}
                                                >
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
                                            <span
                                                className={`inline-flex items-center gap-[5px] rounded-[5px] text-[9px] py-[5px] px-2 [&_i]:bg-current [&_i]:w-1 [&_i]:h-1 [&_i]:rounded-full ${statusClasses[item.status]}`}
                                            >
                                                <i />
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="text-[#8390a4] text-[10px]">{item.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filtered.length === 0 && (
                            <div className="text-center text-[var(--muted)] py-10 px-5 [&_h3]:text-[var(--ink)] [&_h3]:text-[14px] [&_p]:text-[11px]">
                                <Icon name="search" />
                                <h3>No applications found</h3>
                                <p>Try another company, role, or status.</p>
                                <button
                                    className="min-h-[42px] inline-flex justify-center items-center gap-[9px] [border:1px_solid_var(--line)] rounded-[7px] whitespace-nowrap text-[11px]! font-medium! bg-white text-[var(--ink)] py-[11px] px-[17px]"
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
                    <div className="flex justify-between gap-[15px] [border-top:1px_solid_var(--line)] text-[#8b97a9] text-[9px] py-[17px] px-[23px] max-[600px]:px-[17px]">
                        Showing {filtered.length} of {applications.length} applications<span>One step closer.</span>
                    </div>
                </section>
                <div className="grid gap-[23px] max-[1200px]:grid-cols-[1fr_1fr] max-[800px]:grid-cols-[1fr]">
                    <section
                        id="goals"
                        className="bg-[#193e79] rounded-[10px] text-white p-[23px] [&_h2]:text-[22px] [&_h2]:leading-[1.4] [&_h2]:font-medium [&_h2]:tracking-[-0.6px] [&_h2]:mt-[18px] [&_h2]:mb-[9px] [&_h2]:max-w-[210px] [&_h2]:mx-0 [&_>_p:not([class])]:text-[10px] [&_>_p]:leading-[1.9] [&_>_p:not([class])]:text-[#b7c9e4] [&_>_p]:m-0 [&_progress]:block [&_progress]:appearance-none [&_progress]:[border:0] [&_progress]:w-full [&_progress]:h-[5px] [&_progress]:rounded-[10px] [&_progress]:overflow-hidden [&_progress]:bg-[#ffffff20] [&_progress]:my-3 [&_progress]:mx-0 [&_progress::-webkit-progress-bar]:bg-[#ffffff20] [&_progress::-webkit-progress-value]:bg-[#a5c7ff] [&_progress::-webkit-progress-value]:rounded-[10px] [&_progress::-moz-progress-bar]:bg-[#a5c7ff]"
                    >
                        <div className="flex items-center gap-[10px] text-[8px] tracking-[1.6px] text-[#bbd0ee]">
                            <span className="grid place-items-center w-[30px] h-[30px] rounded-[7px] bg-[#ffffff12] text-[#bcd4fc]">
                                <Icon name="goal" />
                            </span>
                            <span>STAY CONSISTENT</span>
                        </div>
                        <h2>A little progress, every day.</h2>
                        <p>Your weekly application goal is within reach. You’ve got this.</p>
                        <div className="flex justify-between items-center mt-6 text-[10px] [&_strong]:text-[16px] [&_strong]:font-[550] [&_strong_span]:text-[9px] [&_strong_span]:font-normal [&_strong_span]:text-[#b7c9e4] [&_>_span]:text-[#bfd7ff]">
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
                        <p className="text-[9px] text-[#a6bfdf]">
                            {applications.length >= 8
                                ? "Goal reached. Take a moment to celebrate!"
                                : `${8 - applications.length} more to reach your sample weekly goal`}
                        </p>
                    </section>
                    <section
                        id="activity"
                        className="bg-white [border:1px_solid_var(--line)] rounded-[10px] overflow-hidden [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:tracking-[-0.3px] [&_h2]:m-0 p-[23px]"
                    >
                        <h2>Recent activity</h2>
                        <p className="text-[var(--muted)] text-[10px] mt-2 mb-6 mx-0">The small wins add up.</p>
                        <ol className="list-none m-0 p-0 [&_li]:flex [&_li]:gap-[11px] [&_li]:relative [&_li]:pb-[25px] [&_li:last-child]:pb-0 [&_li:not(:last-child)::before]:[content:''] [&_li:not(:last-child)::before]:absolute [&_li:not(:last-child)::before]:top-[30px] [&_li:not(:last-child)::before]:bottom-0 [&_li:not(:last-child)::before]:left-[14px] [&_li:not(:last-child)::before]:w-[1px] [&_li:not(:last-child)::before]:bg-[var(--line)] [&_strong]:block [&_strong]:text-[10px] [&_strong]:font-[550] [&_strong]:pt-[2px] [&_p]:text-[#8190a4] [&_p]:text-[9px] [&_p]:leading-[1.7] [&_p]:my-[6px] [&_p]:mx-0 [&_time]:text-[#a0aabb] [&_time]:text-[8px]">
                            <li>
                                <span className="w-[29px] h-[29px] rounded-full grid place-items-center shrink-0 [&_svg]:w-[13px] [&_svg]:h-[13px] text-[#288960] bg-[#e9f7ef]">
                                    <Icon name="check" />
                                </span>
                                <div>
                                    <strong>An offer from Spotify</strong>
                                    <p>Your next chapter looks promising.</p>
                                    <time dateTime="2026-09-19">Sep 19 · Sample activity</time>
                                </div>
                            </li>
                            <li>
                                <span className="w-[29px] h-[29px] rounded-full grid place-items-center shrink-0 [&_svg]:w-[13px] [&_svg]:h-[13px] text-[#7960ce] bg-[#f0ecfc]">
                                    <Icon name="overview" />
                                </span>
                                <div>
                                    <strong>Interview with Linear</strong>
                                    <p>Time to make a great impression.</p>
                                    <time dateTime="2026-09-18">Sep 18 · Sample activity</time>
                                </div>
                            </li>
                            <li>
                                <span className="w-[29px] h-[29px] rounded-full grid place-items-center shrink-0 [&_svg]:w-[13px] [&_svg]:h-[13px] text-[#3771d7] bg-[#edf3ff]">
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
            <footer className="flex justify-between gap-[15px] text-[#a0aabb] mt-7 text-[9px] leading-[1.6] max-[600px]:flex-col max-[600px]:gap-[5px]">
                Built for your next big step.<span>ApplyFlow · Your job search, organized.</span>
            </footer>
        </>
    );
}
