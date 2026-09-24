import "server-only";

import { db } from "@/app/_db/index";
import { applications } from "@/drizzle/schema";
import { eq } from "drizzle-orm";
import { session } from "@/app/_lib/session";

export async function getAllApplicationsById(id: string) {
    return await db.select().from(applications).where(eq(applications.userId, id));
}

export async function getAllApplicationsCurrentUser() {
    const data = await session();
    if (!data) {
        throw new Error("No session current user");
    }

    return await getAllApplicationsById(data.user_id);
}

export async function getApplicationById(id: number) {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));

    return application;
}
export async function createApplication(data: typeof applications.$inferInsert) {
    const [application] = await db.insert(applications).values(data).returning();

    return application;
}
export async function deleteApplicationById(id: number) {
    await db.delete(applications).where(eq(applications.id, id));
}
