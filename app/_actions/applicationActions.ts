"use server";

import { createApplication, deleteApplicationById, updateApplicationById } from "@/app/_db/applications";
import { session } from "@/app/_lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function addApplication(formData: FormData) {
    const user = await session("/login");
    if (!user) redirect("/login");

    await createApplication({ ...getApplicationValues(formData), userId: user.user_id });
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
}

export async function updateApplicationAction(applicationId: number, formData: FormData) {
    const user = await session("/login");
    if (!user) redirect("/login");
    if (!Number.isSafeInteger(applicationId) || applicationId <= 0) {
        throw new Error("Invalid application ID");
    }

    const application = await updateApplicationById(applicationId, user.user_id, getApplicationValues(formData));
    if (!application) throw new Error("Application not found");

    revalidatePath("/applications");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
}

function getApplicationValues(formData: FormData) {
    const status = getString(formData, "status");
    return {
        companyName: getString(formData, "companyName"),
        jobTitle: getString(formData, "jobTitle"),
        status,

        jobUrl: getOptionalString(formData, "jobUrl"),
        source: getOptionalString(formData, "source"),

        location: getString(formData, "location"),
        workMode: getString(formData, "workMode"),
        employmentType: getString(formData, "employmentType"),

        salaryMin: getOptionalString(formData, "salaryMin"),
        salaryMax: getOptionalString(formData, "salaryMax"),
        currency: getOptionalString(formData, "currency"),

        dateApplied: status === "Saved" ? null : getOptionalString(formData, "dateApplied"),
        deadline: getOptionalString(formData, "deadline"),
        notes: getOptionalString(formData, "notes"),
    };
}

export async function deleteApplicationAction(applicationId: number) {
    await deleteApplicationById(applicationId);
    revalidatePath("/applications");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
}

function getString(formData: FormData, name: string) {
    const value = formData.get(name);

    if (typeof value !== "string") {
        throw new Error(`${name} must be a string`);
    }

    return value;
}

function getOptionalString(formData: FormData, name: string) {
    const value = formData.get(name);

    if (typeof value !== "string" || value === "") {
        return null;
    }

    return value;
}
