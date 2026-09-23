import "server-only";

import { db } from "@/app/_db/index";
import { applications } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export async function getAllApplicationsById(id: string) {
    // where... how do i reference fore
    const data = await db.select().from(applications).where(eq(applications.userId, id));
    console.log(data);
}
export async function getApplicationById(id: number) {
    const [application] = await db.select().from(applications).where(eq(applications.id, id));

    return application;
}
export async function createApplication(data: typeof applications.$inferInsert) {
    const [application] = await db.insert(applications).values(data).returning();

    return application;
}
