import { redirect } from "next/navigation";
import { getProfile } from "@/app/_db/profiles";
import { requireGoogleUser } from "@/app/_lib/session";
import { registrationDestination } from "@/app/_lib/auth-policy";
import { AuthShell } from "@/app/_components/auth/auth-shell";
import { ProfileForm } from "./profile-form";

export const metadata = { title: "Finish signing up | ApplyFlow" };

export default async function CompleteSignupPage() {
    const { user, email, success } = await requireGoogleUser();
    if (!user || !email || !success) redirect("/login");
    const profile = await getProfile(user.id);
    if (profile) redirect(registrationDestination(profile, email));
    // Prefer the Google identity's suggestion over metadata from an older email signup.
    const google = user.identities?.find((identity) => identity.provider === "google");
    const name = google?.identity_data?.full_name || google?.identity_data?.name;
    return (
        <AuthShell>
            <ProfileForm
                email={email}
                fullName={typeof name === "string" ? name : ""}
                today={new Date().toISOString().slice(0, 10)}
            />
        </AuthShell>
    );
}
