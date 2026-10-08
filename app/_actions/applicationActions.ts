"use server";

import { createApplication, deleteApplicationById, updateApplicationById } from "@/app/_db/applications";
import { session } from "@/app/_lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isCalendarDate } from "@/app/_lib/calendar";

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
    const interviewDate = getOptionalString(formData, "interviewDate");
    const interviewTime = getOptionalString(formData, "interviewTime");
    if (interviewDate && !isCalendarDate(interviewDate)) {
        throw new Error("Enter a valid interview date from 1900 onward.");
    }
    if (interviewTime && (!interviewDate || !/^([01]\d|2[0-3]):[0-5]\d$/.test(interviewTime))) {
        throw new Error("Enter a valid interview time with an interview date.");
    }
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
        interviewDate,
        interviewTime,
        notes: getOptionalString(formData, "notes"),
    };
}

export async function deleteApplicationAction(applicationId: number) {
    const user = await session("/login");
    if (!user) redirect("/login");
    if (!Number.isSafeInteger(applicationId) || applicationId <= 0) {
        return { success: false, message: "This application could not be found. Refresh the page and try again." };
    }

    try {
        if (!(await deleteApplicationById(applicationId, user.user_id))) {
            return { success: false, message: "This application could not be found. Refresh the page and try again." };
        }
    } catch {
        return { success: false, message: "Your application could not be deleted. Please try again." };
    }

    revalidatePath("/applications");
    revalidatePath("/dashboard");
    revalidatePath("/calendar");
    return { success: true, message: "Application deleted." };
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
