export type IconName =
    | "overview"
    | "applications"
    | "calendar"
    | "profile"
    | "settings"
    | "sign-out"
    | "activity"
    | "goal"
    | "arrow"
    | "search"
    | "plus"
    | "menu"
    | "close"
    | "check"
    | "more"
    | "chevron-left"
    | "chevron-right"
    | "sort";
const paths: Record<IconName, string> = {
    calendar: "M3 5h18v16H3z M3 10h18 M7 3v4 M17 3v4 M7 14h2 M15 14h2 M7 17h2",
    profile: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M4 21v-2a8 8 0 0 1 16 0v2",
    settings: "M4 6h16 M4 12h16 M4 18h16 M8 3v6 M16 9v6 M10 15v6",
    "sign-out": "M9 4H4v16h5 M9 12h12 M17 8l4 4-4 4",
    overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    applications: "M8 6V3h8v3 M3 7h18v14H3z M3 12h18 M10 12v3h4v-3",
    activity: "M3 12h4l3-8 4 16 3-8h4",
    goal: "M12 8a4 4 0 1 0 4 4 M12 3a9 9 0 1 0 9 9 M12 12l9-9 M16 3h5v5",
    arrow: "M5 12h14 M13 6l6 6-6 6",
    search: "M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    plus: "M12 5v14 M5 12h14",
    menu: "M3 6h18 M3 12h18 M3 18h18",
    close: "M6 6l12 12 M6 18 18 6",
    check: "M5 12l4 4L19 6",
    more: "M5 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2 M12 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2 M19 11a1 1 0 1 0 0 2 1 1 0 0 0 0-2",
    "chevron-left": "M15 6l-6 6 6 6",
    "chevron-right": "M9 6l6 6-6 6",
    sort: "M8 4v16 M4 8l4-4 4 4 M16 20V4 M12 16l4 4 4-4",
};
export default function DashboardIcon({ name }: { name: IconName }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d={paths[name]} />
        </svg>
    );
}
