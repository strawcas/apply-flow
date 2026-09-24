import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProfileOverview from "@/app/_components/dashboard/profile-overview";
import { session } from "@/app/_lib/session";

export const metadata: Metadata = { title: "Your profile | ApplyFlow" };

export default async function ProfilePage() {
    const profile = await session("/login");
    if (!profile) redirect("/login");

    return <ProfileOverview profile={profile} />;
}
