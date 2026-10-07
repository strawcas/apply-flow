import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { db } from "@/app/_db/index";
import { calendarEvents } from "@/drizzle/schema";
import { session } from "@/app/_lib/session";
import {
    calendarKindFromStorage,
    storedCalendarKinds,
    type CalendarEventValues,
    type CalendarItem,
} from "@/app/_lib/calendar";

export async function getCalendarEventsCurrentUser() {
    const user = await session("/login");
    if (!user) throw new Error("No session current user");
    const rows = await db
        .select()
        .from(calendarEvents)
        .where(eq(calendarEvents.userId, user.user_id))
        .orderBy(asc(calendarEvents.date), asc(calendarEvents.time), asc(calendarEvents.id));
    return rows.map(({ id, title, kind, date, time, endTime, company, location, notes }): CalendarItem => ({
        id,
        title,
        date,
        source: "event",
        kind: calendarKindFromStorage(kind),
        time: time || null,
        endTime: endTime || null,
        company: company || null,
        location: location || null,
        notes: notes || null,
    }));
}

function storageValues(values: CalendarEventValues) {
    return {
        title: values.title,
        kind: storedCalendarKinds[values.kind],
        date: values.date,
        time: values.time ?? "",
        endTime: values.endTime ?? "",
        company: values.company ?? "",
        location: values.location ?? "",
        notes: values.notes ?? "",
    };
}

export async function createCalendarEvent(userId: string, values: CalendarEventValues) {
    await db.insert(calendarEvents).values({ ...storageValues(values), userId });
}

export async function updateCalendarEvent(id: string, userId: string, values: CalendarEventValues) {
    const rows = await db
        .update(calendarEvents)
        .set(storageValues(values))
        .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
        .returning({ id: calendarEvents.id });
    return rows.length > 0;
}

export async function deleteCalendarEvent(id: string, userId: string) {
    const rows = await db
        .delete(calendarEvents)
        .where(and(eq(calendarEvents.id, id), eq(calendarEvents.userId, userId)))
        .returning({ id: calendarEvents.id });
    return rows.length > 0;
}
