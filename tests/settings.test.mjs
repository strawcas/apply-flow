import assert from "node:assert/strict";
import test from "node:test";
import { defaultSettings, readSettings, parseSettings } from "../app/_lib/settings.ts";
import { calendarDays, formatCalendarTimeRange } from "../app/_lib/calendar.ts";
import { applicationsCsv, calendarIcs } from "../app/_lib/data-export.ts";

test("settings reject invalid input and safely normalize absent or tampered account metadata", () => {
    for (const metadata of [
        null,
        undefined,
        "invalid",
        [],
        { calendarView: "week", weekStartsOn: 4, currency: "BAD", workMode: "Anywhere" },
    ]) {
        assert.deepEqual(readSettings(metadata), defaultSettings);
    }
    const preferences = {
        calendarView: "agenda",
        weekStartsOn: 1,
        timeFormat: "24h",
        currency: "PHP",
        workMode: "Hybrid",
    };
    assert.deepEqual(readSettings({ ...preferences, admin: true }), preferences);
    const form = new FormData();
    for (const [key, value] of Object.entries(preferences)) form.set(key, String(value));
    form.set("userId", "someone-else");
    assert.deepEqual(parseSettings(form), { success: true, values: preferences });
    for (const [key, value] of [
        ["calendarView", "week"],
        ["weekStartsOn", "5"],
        ["timeFormat", "bad"],
        ["currency", "BAD"],
        ["workMode", "Anywhere"],
    ]) {
        const previous = form.get(key);
        form.set(key, value);
        assert.equal(parseSettings(form).success, false, key);
        form.set(key, previous);
    }
    assert.equal(parseSettings(new FormData()).success, false);
    form.set("currency", new File(["PHP"], "currency.txt"));
    assert.equal(parseSettings(form).success, false);
});

test("Monday grids cover entire months and time preferences preserve midnight, ranges, and all-day labels", () => {
    const days = calendarDays("2026-10", 1);
    assert.equal(days[0], "2026-09-28");
    assert.equal(days.at(-1), "2026-11-08");
    for (const month of ["2026-02", "2024-02", "2026-06", "2026-11", "2026-12"]) {
        const grid = calendarDays(month, 1);
        assert.equal(grid.length, 42);
        assert.equal(new Date(`${grid[0]}T00:00:00Z`).getUTCDay(), 1);
        const monthLength = new Date(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5)), 0)).getUTCDate();
        assert.equal(grid.filter((day) => day.startsWith(month)).length, monthLength);
    }
    assert.equal(formatCalendarTimeRange("00:00", "13:30", "24h"), "00:00 – 13:30");
    assert.equal(formatCalendarTimeRange("00:00", null, "12h"), "12:00 AM");
    assert.equal(formatCalendarTimeRange(null, null, "24h"), "All day");
});

const application = {
    id: 1,
    userId: "private-account-id",
    companyName: 'Example, "Inc"',
    jobTitle: "工程师 👩‍💻",
    status: "Applied",
    dateApplied: "2026-10-07",
    deadline: "2026-10-14",
    interviewDate: "2026-10-15",
    interviewTime: "09:30",
    jobUrl: null,
    source: "Website",
    location: "Remote",
    workMode: "Remote",
    employmentType: "Full-time",
    salaryMin: "50000.00",
    salaryMax: "60000.00",
    currency: "PHP",
    notes: "First line\nSecond line",
    createdAt: new Date("2026-10-07T10:00:00Z"),
};

test("CSV handles quotes, multiline notes, Unicode, nulls, empty exports, and spreadsheet formulas", () => {
    const csv = applicationsCsv([application]);
    assert.ok(csv.startsWith("\uFEFF"));
    assert.ok(csv.includes('"Example, ""Inc"""'));
    assert.ok(csv.includes('"First line\nSecond line"'));
    assert.ok(csv.includes('"工程师 👩‍💻"'));
    assert.doesNotMatch(csv, /private-account-id/);
    assert.ok(csv.includes('"50000.00","60000.00","PHP"'));
    assert.ok(csv.includes('"Interview date","Interview time"'));
    assert.ok(csv.includes('"2026-10-15","09:30"'));
    assert.equal(applicationsCsv([]).split("\r\n").length, 2);
    for (const value of ["=SUM(1,2)", "+cmd", "-cmd", "@formula", "  =formula", "\ttext", "\rtext"]) {
        const safe = applicationsCsv([{ ...application, companyName: value }]);
        assert.ok(safe.includes(`"'${value}"`), value);
    }
});

const event = {
    id: "event-id",
    source: "event",
    title: "Interview, preparation; next",
    company: "Example",
    kind: "Interview",
    date: "2026-10-07",
    time: "14:00",
    endTime: "15:30",
    location: "Room, 2; online",
    notes: "Bring CV\\notes\r\nBEGIN:VEVENT\n准备 👩‍💻".repeat(12),
};

test("iCalendar preserves local times and ranges, escapes text, and folds UTF-8 without splitting characters", () => {
    const deadline = {
        ...event,
        id: "application-1",
        source: "application",
        kind: "Deadline",
        date: "9999-12-31",
        time: null,
        endTime: null,
    };
    const ics = calendarIcs([event, deadline], new Date("2026-10-07T00:00:00Z"));
    assert.equal((ics.match(/^BEGIN:VEVENT\r?$/gm) ?? []).length, 2);
    for (const line of ics.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75, line);
    const unfolded = ics.replaceAll("\r\n ", "");
    assert.ok(unfolded.includes("DTSTART:20261007T140000\r\nDTEND:20261007T153000"));
    assert.ok(unfolded.includes("DTSTART;VALUE=DATE:99991231\r\nDURATION:P1D"));
    assert.ok(unfolded.includes("DTSTAMP:20261007T000000Z"));
    assert.ok(unfolded.includes("SUMMARY:Interview\\, preparation\\; next · Example"));
    assert.ok(unfolded.includes("LOCATION:Room\\, 2\\; online"));
    assert.ok(unfolded.includes("DESCRIPTION:Bring CV\\\\notes\\nBEGIN:VEVENT\\n准备 👩‍💻"));
    assert.ok(unfolded.includes("UID:event-event-id@applyflow.local"));
    assert.ok(unfolded.includes("UID:application-application-1@applyflow.local"));
    assert.ok(calendarIcs([]).endsWith("END:VCALENDAR\r\n"));
    const startOnly = calendarIcs([{ ...event, endTime: null }]);
    assert.doesNotMatch(startOnly, /DTEND/);
});
