"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateProfile } from "@/app/_db/profiles";
import { validateProfile } from "@/app/_lib/auth-policy";
import { session } from "@/app/_lib/session";

export type ProfileValues = { fullName: string; birthDate: string };
export type ProfileResult =
    { success: true; message: string; values: ProfileValues } | { success: false; message: string };

export async function saveProfile(formData: FormData): Promise<ProfileResult> {
    const profile = await session("/login");
    if (!profile) redirect("/login");

    const fullName = formData.get("fullName");
    const birthDate = formData.get("birthDate");
    const message = validateProfile(fullName, birthDate);
    if (message) return { success: false, message };

    const values = { fullName: (fullName as string).trim(), birthDate: birthDate as string };
    try {
        // The account ID always comes from the verified session, never the form.
        const updated = await updateProfile(profile.user_id, values.fullName, values.birthDate);
        if (!updated) return { success: false, message: "Your profile could not be found. Please sign in again." };
    } catch {
        return { success: false, message: "We couldn't save your changes. Please try again." };
    }

    revalidatePath("/profile");
    return { success: true, message: "Your profile has been updated.", values };
}
