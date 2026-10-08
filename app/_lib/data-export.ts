import type { applications } from "@/drizzle/schema";
import type { CalendarItem } from "./calendar";

type Application = typeof applications.$inferSelect;

function csvCell(value: string | number | Date | null) {
    let text = value instanceof Date ? value.toISOString() : String(value ?? "");
    // Keep user-entered text from being interpreted as a spreadsheet formula.
    if (typeof value === "string" && /^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replaceAll('"', '""')}"`;
}

export function applicationsCsv(rows: Application[]) {
    const headers = [
        "ID",
        "Company",
        "Job title",
        "Status",
        "Date applied",
        "Deadline",
        "Interview date",
        "Interview time",
        "Job URL",
        "Source",
        "Location",
        "Work arrangement",
        "Employment type",
        "Salary minimum",
        "Salary maximum",
        "Currency",
        "Notes",
        "Created at",
    ];
    const records = rows.map((row) => [
        row.id,
        row.companyName,
        row.jobTitle,
        row.status,
        row.dateApplied,
        row.deadline,
        row.interviewDate,
        row.interviewTime,
        row.jobUrl,
        row.source,
        row.location,
        row.workMode,
        row.employmentType,
        row.salaryMin,
        row.salaryMax,
        row.currency,
        row.notes,
        row.createdAt,
    ]);
    return `\uFEFF${[headers, ...records].map((record) => record.map(csvCell).join(",")).join("\r\n")}\r\n`;
}

function calendarText(value: string) {
    return value
        .replaceAll("\\", "\\\\")
        .replace(/\r\n|\r|\n/g, "\\n")
        .replaceAll(";", "\\;")
        .replaceAll(",", "\\,");
}

// RFC 5545 limits physical lines to 75 UTF-8 bytes. Fold between whole characters.
function foldCalendarLine(line: string) {
    const encoder = new TextEncoder();
    let output = "";
    let length = 0;
    for (const character of line) {
        const bytes = encoder.encode(character).length;
        if (length + bytes > 75) {
            output += "\r\n ";
            length = 1;
        }
        output += character;
        length += bytes;
    }
    return output;
}

export function calendarIcs(items: CalendarItem[], now = new Date()) {
    const stamp = now
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d{3}Z$/, "Z");
    const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ApplyFlow//Calendar//EN", "CALSCALE:GREGORIAN"];
    for (const item of items) {
        const date = item.date.replaceAll("-", "");
        const summary = item.company ? `${item.title} · ${item.company}` : item.title;
        lines.push(
            "BEGIN:VEVENT",
            `UID:${item.source}-${item.id}@applyflow.local`,
            `DTSTAMP:${stamp}`,
            `SUMMARY:${calendarText(summary)}`,
            `CATEGORIES:${calendarText(item.kind)}`,
        );
        if (item.time) {
            // The app stores local wall-clock times, so exports preserve them as floating times.
            lines.push(`DTSTART:${date}T${item.time.replace(":", "")}00`);
            if (item.endTime) lines.push(`DTEND:${date}T${item.endTime.replace(":", "")}00`);
        } else {
            lines.push(`DTSTART;VALUE=DATE:${date}`, "DURATION:P1D");
        }
        if (item.location) lines.push(`LOCATION:${calendarText(item.location)}`);
        if (item.notes) lines.push(`DESCRIPTION:${calendarText(item.notes)}`);
        lines.push("END:VEVENT");
    }
    lines.push("END:VCALENDAR");
    return `${lines.map(foldCalendarLine).join("\r\n")}\r\n`;
}
