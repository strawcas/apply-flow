"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "@/app/_db/calendar";
import { parseCalendarEvent } from "@/app/_lib/calendar";
import { session } from "@/app/_lib/session";

const eventIdPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function saveCalendarEvent(id: string | null, formData: FormData) {
    const user = await session("/login");
    if (!user) redirect("/login");
    if (id !== null && (typeof id !== "string" || !eventIdPattern.test(id))) {
        return { success: false, message: "This event could not be found. Refresh your calendar and try again." };
    }
    const parsed = parseCalendarEvent(formData);
    if (!parsed.success) return parsed;
    try {
        if (id === null) {
            await createCalendarEvent(user.user_id, parsed.values);
        } else if (!(await updateCalendarEvent(id, user.user_id, parsed.values))) {
            return { success: false, message: "This event could not be found. Refresh your calendar and try again." };
        }
    } catch {
        return { success: false, message: "Your event could not be saved. Please try again." };
    }
    revalidatePath("/calendar");
    return { success: true, message: id === null ? "Event added to your calendar." : "Event updated." };
}

export async function removeCalendarEvent(id: string) {
    const user = await session("/login");
    if (!user) redirect("/login");
    if (typeof id !== "string" || !eventIdPattern.test(id)) {
        return { success: false, message: "This event could not be found. Refresh your calendar and try again." };
    }
    try {
        if (!(await deleteCalendarEvent(id, user.user_id))) {
            return { success: false, message: "This event could not be found. Refresh your calendar and try again." };
        }
    } catch {
        return { success: false, message: "Your event could not be deleted. Please try again." };
    }
    revalidatePath("/calendar");
    return { success: true, message: "Event deleted." };
}
