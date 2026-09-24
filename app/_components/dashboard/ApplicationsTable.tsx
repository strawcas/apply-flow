import Icon from "@/app/_components/dashboard/dashboard-icon";
import { getAllApplicationsCurrentUser } from "@/app/_db/applications";
import ApplicationsTableRow from "@/app/_components/dashboard/ApplicationsTableRow";

type ApplicationStatus = "Applied" | "In review" | "Interview" | "Offer" | "Rejected";

const statusStyles: Record<ApplicationStatus, string> = {
    Applied: "text-[#396ab6] bg-[#edf3ff]",
    "In review": "text-[#8b691e] bg-[#fff6e6]",
    Interview: "text-[#7957b0] bg-[#f2edfc]",
    Offer: "text-[#347b52] bg-[#edf8f0]",
    Rejected: "text-[#ab575b] bg-[#fdf0f1]",
};

export default async function ApplicationsTable() {
    const applications = await getAllApplicationsCurrentUser();
    return (
        <section
            className="overflow-hidden [border:1px_solid_var(--line)] rounded-[10px] bg-white"
            aria-labelledby="applications-title"
        >
            <div className="flex items-center justify-between gap-4 pt-6 pb-5 px-6 max-[600px]:flex-wrap max-[600px]:py-5 max-[600px]:px-[17px]">
                <div className="flex items-center gap-[9px] [&_h2]:text-[20px] [&_h2]:font-semibold [&_h2]:tracking-[-0.3px] [&_h2]:m-0">
                    <h2 id="applications-title">All applications</h2>
                    <span className="rounded-[5px] bg-[#edf3ff] text-[#3567bc] text-[14px] font-semibold py-[3px] px-[10px]">
                        {applications.length}
                    </span>
                </div>
                <span className="text-[#52637d] text-[14px] tracking-[0.6px] uppercase whitespace-nowrap">
                    Sample data
                </span>
            </div>

            <div className="flex items-center justify-between gap-4 pt-0 pb-[22px] px-6 max-[1000px]:items-stretch max-[1000px]:flex-col max-[1000px]:gap-[10px] max-[600px]:pt-0 max-[600px]:pb-[18px] max-[600px]:px-[17px]">
                <label className="flex items-center gap-[10px] flex-1 min-w-0 max-w-110 [border:1px_solid_#e2e8f0] rounded-[6px] bg-white py-0 px-3 [&_svg]:w-5 [&_svg]:h-5 [&_svg]:shrink-0 [&_svg]:text-[#52637d] [&_input]:w-full [&_input]:min-w-0 [&_input]:h-12 [&_input]:[border:0] [&_input]:bg-transparent [&_input]:text-[var(--ink)] [&_input]:text-[16px] [&_input]:p-0 [&_input::placeholder]:text-[#52637d] [&_input::placeholder]:opacity-[1] max-[1000px]:max-w-none">
                    <Icon name="search" />
                    <input
                        type="search"
                        aria-label="Search applications"
                        placeholder="Search by company or role…"
                        disabled
                    />
                </label>
                <div className="flex gap-[10px] [&_select]:min-h-[50px] [&_select]:[border:1px_solid_#e2e8f0] [&_select]:rounded-[6px] [&_select]:bg-white [&_select]:text-[#42536d] [&_select]:text-[16px] [&_select]:whitespace-nowrap [&_select]:min-w-39 [&_select]:py-0 [&_select]:px-[14px] max-[600px]:[&_>_*]:[flex:1_1_150px] max-[600px]:[&_>_*]:min-w-0 max-[600px]:flex-wrap">
                    <select aria-label="Filter by status" defaultValue="all" disabled>
                        <option value="all">All statuses</option>
                        {Object.keys(statusStyles).map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="min-h-[50px] [border:1px_solid_#e2e8f0] rounded-[6px] bg-white text-[#42536d] text-[16px] whitespace-nowrap inline-flex items-center justify-center gap-2 py-0 px-[14px] [&_svg]:w-5 [&_svg]:h-5"
                        disabled
                    >
                        <Icon name="sort" /> Newest first
                    </button>
                </div>
            </div>

            <div
                className="relative overflow-x-auto overscroll-x-contain focus-visible:outline-offset-[-3px]"
                role="region"
                aria-label="Applications table"
                tabIndex={0}
            >
                <table className="w-full min-w-350 border-collapse text-left whitespace-nowrap [&_thead_th]:[border-block:1px_solid_var(--line)] [&_thead_th]:bg-[#fafbfd] [&_thead_th]:text-[#42536d] [&_thead_th]:text-[14px] [&_thead_th]:font-semibold [&_thead_th]:py-[18px] [&_thead_th]:px-5 [&_tbody_th]:h-24 [&_tbody_th]:[border-bottom:1px_solid_#edf1f6] [&_tbody_th]:font-normal [&_tbody_th]:p-5 [&_td]:h-24 [&_td]:[border-bottom:1px_solid_#edf1f6] [&_td]:font-normal [&_td]:p-5 [&_tr_>_:first-child]:pl-6 [&_tr_>_:last-child]:pr-5 [&_tbody_tr:last-child_>_*]:[border-bottom:0] [&_tbody_tr:hover]:bg-[#fbfcff]">
                    <caption className="absolute w-[1px] h-[1px] overflow-hidden [clip-path:inset(50%)] whitespace-nowrap">
                        Sample job applications and their progress
                    </caption>
                    <thead>
                        <tr>
                            <th scope="col">Company &amp; role</th>
                            <th scope="col">Status</th>
                            <th scope="col">Location</th>
                            <th scope="col">Work arrangement</th>
                            <th scope="col">Employment type</th>
                            <th scope="col">Date applied</th>
                            <th scope="col">Next step</th>
                            <th scope="col">
                                <span className="absolute w-[1px] h-[1px] overflow-hidden [clip-path:inset(50%)] whitespace-nowrap">
                                    Actions
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map((application) => (
                            <ApplicationsTableRow applicationData={application} key={application.id} />
                        ))}
                    </tbody>
                </table>
            </div>

            <footer className="flex items-center justify-between gap-4 [border-top:1px_solid_var(--line)] py-[15px] px-6 [&_p:not([class])]:text-[#52637d] [&_p:not([class])]:text-[14px] [&_p:not([class])]:leading-[1.6] [&_p:not([class])]:m-0 [&_strong]:text-[#52637d] [&_strong]:font-medium max-[600px]:flex-wrap max-[600px]:gap-3 max-[600px]:py-[14px] max-[600px]:px-[17px]">
                <p>
                    Showing <strong>1–{applications.length}</strong> of <strong>{applications.length}</strong>{" "}
                    applications
                </p>
                <nav className="flex items-center gap-[5px]" aria-label="Application pages">
                    <button
                        type="button"
                        className="inline-grid place-items-center w-11 h-11 [border:1px_solid_var(--line)] rounded-[6px] bg-transparent text-[#a5afbe] p-0 [&_svg]:w-5 [&_svg]:h-5"
                        aria-label="Previous page"
                        disabled
                    >
                        <Icon name="chevron-left" />
                    </button>
                    <button
                        type="button"
                        className="inline-grid place-items-center w-11 h-11 [border:1px_solid_#dce8ff] rounded-[6px] bg-[#edf3ff] text-[var(--accent)] text-[16px] font-normal p-0"
                        aria-label="Page 1"
                        aria-current="page"
                        disabled
                    >
                        1
                    </button>
                    <button
                        type="button"
                        className="inline-grid place-items-center w-11 h-11 [border:1px_solid_var(--line)] rounded-[6px] bg-transparent text-[#a5afbe] p-0 [&_svg]:w-5 [&_svg]:h-5"
                        aria-label="Next page"
                        disabled
                    >
                        <Icon name="chevron-right" />
                    </button>
                </nav>
            </footer>
        </section>
    );
}
