"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireGoogleUser, session } from "@/app/_lib/session";
import { parseSettings, settingsMetadataKey, type Settings } from "@/app/_lib/settings";

export type SettingsResult = { success: true; values: Settings; message: string } | { success: false; message: string };

export async function saveSettings(formData: FormData): Promise<SettingsResult> {
    const profile = await session("/login");
    if (!profile) redirect("/login");
    const auth = await requireGoogleUser();
    if (!auth.success || !auth.user || !auth.supabase) redirect("/login");
    const result = parseSettings(formData);
    if (!result.success) return result;

    try {
        // updateUser uses the authenticated session. No account IDs or other metadata come from the form.
        const { data, error } = await auth.supabase.auth.updateUser({ data: { [settingsMetadataKey]: result.values } });
        if (error || !data.user) return { success: false, message: "Settings could not be saved. Please try again." };
    } catch {
        return { success: false, message: "Settings could not be saved. Check your connection and try again." };
    }
    revalidatePath("/", "layout");
    return { success: true, values: result.values, message: "Settings saved." };
}
