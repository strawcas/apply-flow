import assert from "node:assert/strict";
import test from "node:test";
import {
    applicationCalendarItems,
    calendarDays,
    formatCalendarDate,
    formatCalendarTime,
    formatCalendarTimeRange,
    calendarKindFromStorage,
    storedCalendarKinds,
    isCalendarDate,
    parseCalendarEvent,
    shiftDate,
    shiftMonth,
    sortCalendarItems,
} from "../app/_lib/calendar.ts";

test("calendar dates cover leap years, year boundaries, and complete weeks", () => {
    assert.equal(isCalendarDate("2024-02-29"), true);
    for (const value of ["2025-02-29", "2026-04-31", "2026-13-01", "1899-12-31", "", "2026-2-01"])
        assert.equal(isCalendarDate(value), false, value);
    assert.equal(shiftDate("2024-02-28", 1), "2024-02-29");
    assert.equal(shiftDate("2026-12-31", 1), "2027-01-01");
    assert.equal(shiftMonth("2026-12", 1), "2027-01");
    assert.equal(shiftMonth("2026-01", -1), "2025-12");
    const days = calendarDays("2026-10");
    assert.equal(days.length, 42);
    assert.equal(days[0], "2026-09-27");
    assert.equal(days.at(-1), "2026-11-07");
    assert.equal(days.filter((day) => day.startsWith("2026-10")).length, 31);
    assert.equal(calendarDays("2024-02").filter((day) => day.startsWith("2024-02")).length, 29);
    const lastMonth = calendarDays("9999-12");
    assert.equal(lastMonth.length, 42);
    assert.equal(lastMonth.filter((day) => isCalendarDate(day) && day.startsWith("9999-12")).length, 31);
    assert.equal(isCalendarDate(lastMonth.at(-1)), false);
});

test("date-only events never shift with time zones or daylight savings", () => {
    const previous = process.env.TZ;
    try {
        for (const zone of ["America/Los_Angeles", "Pacific/Honolulu", "Asia/Manila", "Pacific/Auckland"]) {
            process.env.TZ = zone;
            assert.equal(shiftDate("2026-03-08", 1), "2026-03-09");
            assert.equal(formatCalendarDate("2026-10-07", { month: "long", day: "numeric" }), "October 7");
        }
    } finally {
        if (previous === undefined) delete process.env.TZ;
        else process.env.TZ = previous;
    }
    assert.equal(formatCalendarTime(null), "All day");
    assert.equal(formatCalendarTime("00:00"), "12:00 AM");
    assert.equal(formatCalendarTime("12:30"), "12:30 PM");
    assert.equal(formatCalendarTime("23:59"), "11:59 PM");
    assert.equal(formatCalendarTimeRange("09:30", "10:30"), "9:30 AM – 10:30 AM");
    assert.equal(formatCalendarTimeRange("09:30", null), "9:30 AM");
    assert.equal(formatCalendarTimeRange(null, null), "All day");
});

test("existing database types round-trip to the calendar labels", () => {
    assert.deepEqual(storedCalendarKinds, {
        Interview: "interview",
        Deadline: "deadline",
        "Follow-up": "follow-up",
        Reminder: "other",
    });
    for (const [label, value] of Object.entries(storedCalendarKinds))
        assert.equal(calendarKindFromStorage(value), label);
});

test("deadlines use the actual deadline rather than an application status or submission date", () => {
    const deadlines = applicationCalendarItems([
        { id: 1, companyName: "Example", jobTitle: "Designer", location: "Remote", deadline: "2026-10-12" },
        { id: 2, companyName: "Other", jobTitle: "Engineer", location: "", deadline: null },
        { id: 3, companyName: "Invalid", jobTitle: "Engineer", location: "", deadline: "2026-02-30" },
    ]);
    assert.equal(deadlines.length, 1);
    assert.equal(deadlines[0].date, "2026-10-12");
    assert.equal(deadlines[0].source, "application");
    assert.equal(deadlines[0].kind, "Deadline");
    const timed = { ...deadlines[0], id: "timed", source: "event", time: "09:00" };
    const early = { ...timed, id: "early", date: "2026-10-11" };
    assert.deepEqual(
        sortCalendarItems([timed, deadlines[0], early]).map((item) => item.id),
        ["early", "application-1", "timed"],
    );
});

test("application interviews use the scheduled date and keep distinct calendar identities from deadlines", () => {
    const application = {
        id: 1,
        companyName: "Example",
        jobTitle: "Designer",
        location: "Manila",
        deadline: "2026-10-12",
        interviewDate: "2026-10-15",
        interviewTime: "09:30",
    };
    const items = applicationCalendarItems([application]);
    assert.equal(items.length, 2);
    assert.equal(items[0].kind, "Deadline");
    assert.equal(items[1].kind, "Interview");
    assert.notEqual(items[0].id, items[1].id);
    assert.equal(items[1].source, "application");
    assert.equal(items[1].date, "2026-10-15");
    assert.equal(items[1].time, "09:30");
    assert.equal(items[1].location, null);
    assert.equal(applicationCalendarItems([{ ...application, interviewTime: null }])[1].time, null);
    const rescheduled = applicationCalendarItems([{ ...application, interviewDate: "2026-10-16" }])[1];
    assert.equal(rescheduled.id, items[1].id);
    assert.equal(rescheduled.date, "2026-10-16");
    for (const interviewDate of [null, "", "2026-02-30"]) {
        assert.equal(applicationCalendarItems([{ ...application, interviewDate }]).length, 1);
    }
});

test("event validation rejects forged, malformed, and oversized values", () => {
    const form = new FormData();
    form.set("title", "  Interview  ");
    form.set("kind", "Interview");
    form.set("date", "2026-10-07");
    form.set("company", "  Example  ");
    form.set("time", "09:30");
    form.set("endTime", "10:30");
    const valid = parseCalendarEvent(form);
    assert.equal(valid.success, true);
    assert.deepEqual(valid.values, {
        title: "Interview",
        kind: "Interview",
        date: "2026-10-07",
        time: "09:30",
        endTime: "10:30",
        company: "Example",
        location: null,
        notes: null,
    });
    for (const [name, invalid] of [
        ["title", " "],
        ["title", "a".repeat(121)],
        ["kind", "Forged"],
        ["date", "2026-02-30"],
        ["time", "24:00"],
        ["time", "09:60"],
        ["endTime", "24:00"],
        ["endTime", "09:30"],
        ["endTime", "09:00"],
        ["company", "a".repeat(121)],
        ["location", "a".repeat(501)],
        ["notes", "a".repeat(2001)],
    ]) {
        const previous = form.get(name);
        form.set(name, invalid);
        assert.equal(parseCalendarEvent(form).success, false, `${name}: ${invalid.slice(0, 15)}`);
        if (previous === null) form.delete(name);
        else form.set(name, previous);
    }
    form.delete("time");
    assert.equal(parseCalendarEvent(form).success, false, "an end time requires a start time");
    form.delete("endTime");
    assert.equal(parseCalendarEvent(form).values.time, null);
    assert.equal(parseCalendarEvent(form).values.endTime, null);
    form.set("title", new Blob(["not a string"]), "title.txt");
    assert.equal(parseCalendarEvent(form).success, false);
});
