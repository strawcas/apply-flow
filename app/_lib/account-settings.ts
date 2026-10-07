import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { requireGoogleUser, session } from "./session";
import { readSettings, settingsMetadataKey } from "./settings";

export const getSettingsCurrentUser = cache(async () => {
    const profile = await session("/login");
    if (!profile) redirect("/login");
    const auth = await requireGoogleUser();
    if (!auth.success || !auth.user) redirect("/login");
    return readSettings(auth.user.user_metadata?.[settingsMetadataKey]);
});
