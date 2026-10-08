import { getAllApplicationsCurrentUser } from "@/app/_db/applications";
import { getCalendarEventsCurrentUser } from "@/app/_db/calendar";
import { applicationCalendarItems, sortCalendarItems } from "@/app/_lib/calendar";
import { applicationsCsv, calendarIcs } from "@/app/_lib/data-export";
import { session } from "@/app/_lib/session";

export async function GET(_request: Request, { params }: { params: Promise<{ format: string }> }) {
    const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
    const profile = await session();
    if (!profile) return Response.json({ message: "Sign in to download your data." }, { status: 401, headers });
    const { format } = await params;
    if (format !== "applications" && format !== "calendar")
        return Response.json({ message: "Export not found." }, { status: 404, headers });

    try {
        const applications = await getAllApplicationsCurrentUser();
        const contents =
            format === "applications"
                ? applicationsCsv(applications)
                : calendarIcs(
                      sortCalendarItems([
                          ...applicationCalendarItems(applications),
                          ...(await getCalendarEventsCurrentUser()),
                      ]),
                  );
        return new Response(contents, {
            headers: {
                ...headers,
                "Content-Type": format === "applications" ? "text/csv; charset=utf-8" : "text/calendar; charset=utf-8",
                "Content-Disposition": `attachment; filename="applyflow-${format}.${format === "applications" ? "csv" : "ics"}"`,
            },
        });
    } catch {
        return Response.json(
            { message: "Your download could not be prepared. Please try again." },
            { status: 500, headers },
        );
    }
}
