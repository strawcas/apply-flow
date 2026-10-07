export const calendarKinds = ["Interview", "Deadline", "Follow-up", "Reminder"] as const;
export type CalendarKind = (typeof calendarKinds)[number];

// UI labels are translated to the values supported by the existing table.
export const storedCalendarKinds: Record<CalendarKind, string> = {
    Interview: "interview",
    Deadline: "deadline",
    "Follow-up": "follow-up",
    Reminder: "other",
};

export function calendarKindFromStorage(value: string): CalendarKind {
    return calendarKinds.find((kind) => storedCalendarKinds[kind] === value) ?? "Reminder";
}

export type CalendarEventValues = {
    title: string;
    kind: CalendarKind;
    date: string;
    time: string | null;
    endTime: string | null;
    company: string | null;
    location: string | null;
    notes: string | null;
};

export type CalendarItem = CalendarEventValues & {
    id: string;
    source: "event" | "application";
};

export function isCalendarDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "1900-01-01") return false;
    const date = new Date(`${value}T00:00:00Z`);
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// Calendar arithmetic uses UTC; these are date-only values, not instants.
export function shiftDate(value: string, days: number) {
    const date = new Date(`${value}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().split("T")[0];
}

export function shiftMonth(month: string, amount: number) {
    const date = new Date(`${month}-01T00:00:00Z`);
    date.setUTCMonth(date.getUTCMonth() + amount);
    return date.toISOString().slice(0, 7);
}

export function calendarDays(month: string, weekStartsOn: 0 | 1 = 0) {
    const first = `${month}-01`;
    const weekday = new Date(`${first}T00:00:00Z`).getUTCDay();
    const start = shiftDate(first, -((weekday - weekStartsOn + 7) % 7));
    return Array.from({ length: 42 }, (_, index) => shiftDate(start, index));
}

export function localToday() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function formatCalendarDate(value: string, options: Intl.DateTimeFormatOptions) {
    return new Intl.DateTimeFormat("en-US", { ...options, timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function formatCalendarTime(value: string | null, format: "12h" | "24h" = "12h") {
    if (!value) return "All day";
    if (format === "24h") return value;
    const [hour, minute] = value.split(":").map(Number);
    return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour < 12 ? "AM" : "PM"}`;
}

export function formatCalendarTimeRange(start: string | null, end: string | null, format: "12h" | "24h" = "12h") {
    return start && end
        ? `${formatCalendarTime(start, format)} – ${formatCalendarTime(end, format)}`
        : formatCalendarTime(start, format);
}

export function sortCalendarItems(items: CalendarItem[]) {
    return [...items].sort(
        (a, b) =>
            a.date.localeCompare(b.date) ||
            (a.time ?? "").localeCompare(b.time ?? "") ||
            a.title.localeCompare(b.title) ||
            a.id.localeCompare(b.id),
    );
}

export function applicationDeadlines(
    applications: {
        id: number;
        companyName: string;
        jobTitle: string;
        deadline: string | null;
        location: string;
    }[],
): CalendarItem[] {
    return applications.flatMap((application) =>
        application.deadline && isCalendarDate(application.deadline)
            ? [
                  {
                      id: `application-${application.id}`,
                      source: "application" as const,
                      title: application.jobTitle,
                      company: application.companyName,
                      kind: "Deadline" as const,
                      date: application.deadline,
                      time: null,
                      endTime: null,
                      location: application.location || null,
                      notes: "This deadline comes from your application. Update it from the Applications page.",
                  },
              ]
            : [],
    );
}

export function parseCalendarEvent(
    formData: FormData,
): { success: true; values: CalendarEventValues } | { success: false; message: string } {
    const read = (name: string) => {
        const value = formData.get(name);
        return typeof value === "string" ? value.trim() : "";
    };
    const title = read("title");
    const kind = read("kind");
    const date = read("date");
    const time = read("time");
    const endTime = read("endTime");
    const company = read("company");
    const location = read("location");
    const notes = read("notes");
    if (!title || title.length > 120) return { success: false, message: "Enter an event title of 1–120 characters." };
    if (!calendarKinds.includes(kind as CalendarKind)) return { success: false, message: "Choose a valid event type." };
    if (!isCalendarDate(date)) return { success: false, message: "Enter a valid date from 1900 onward." };
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time))
        return { success: false, message: "Enter a valid time, or leave it empty for an all-day event." };
    if (endTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime))
        return { success: false, message: "Enter a valid end time, or leave it empty." };
    if (endTime && (!time || endTime <= time))
        return { success: false, message: "End time must be after the start time on the same day." };
    if (company.length > 120 || location.length > 500 || notes.length > 2000) {
        return {
            success: false,
            message: "Use at most 120 characters for the company, 500 for the location, and 2000 for notes.",
        };
    }
    return {
        success: true,
        values: {
            title,
            kind: kind as CalendarKind,
            date,
            time: time || null,
            endTime: endTime || null,
            company: company || null,
            location: location || null,
            notes: notes || null,
        },
    };
}
