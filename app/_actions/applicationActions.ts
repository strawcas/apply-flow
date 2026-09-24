"use server";

import { createApplication } from "@/app/_db/applications";
import { session } from "@/app/_lib/session";
import { redirect } from "next/navigation";

export async function addApplication(formData: FormData) {
    const user = await session("/login");
    if (!user) redirect("/login");

    const application = {
        companyName: getString(formData, "companyName"),
        jobTitle: getString(formData, "jobTitle"),
        status: getString(formData, "status"),

        jobUrl: getOptionalString(formData, "jobUrl"),
        source: getOptionalString(formData, "source"),

        location: getString(formData, "location"),
        workMode: getString(formData, "workMode"),
        employmentType: getString(formData, "employmentType"),

        salaryMin: getOptionalString(formData, "salaryMin"),
        salaryMax: getOptionalString(formData, "salaryMax"),
        currency: getOptionalString(formData, "currency"),

        dateApplied: getOptionalString(formData, "dateApplied"),
        deadline: getOptionalString(formData, "deadline"),
        notes: getOptionalString(formData, "notes"),

        userId: user.user_id,
    };

    console.log(application);

    await createApplication(application);
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
