import type { Metadata } from "next";
import CalendarOverview from "@/app/_components/dashboard/calendar-overview";
import { getAllApplicationsCurrentUser } from "@/app/_db/applications";
import { getCalendarEventsCurrentUser } from "@/app/_db/calendar";
import { applicationCalendarItems, sortCalendarItems } from "@/app/_lib/calendar";

export const metadata: Metadata = { title: "Calendar | ApplyFlow" };

export default async function CalendarPage() {
    const [applications, events] = await Promise.all([getAllApplicationsCurrentUser(), getCalendarEventsCurrentUser()]);
    const items = sortCalendarItems([...applicationCalendarItems(applications), ...events]);
    return <CalendarOverview items={items} initialToday={new Date().toISOString().slice(0, 10)} />;
}
