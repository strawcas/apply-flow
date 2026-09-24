import { session } from "@/app/_lib/session";

export default async function ProfilePage() {
    const profile = await session();
    return (
        <header>
            <h1>Profile</h1>
            <dl>
                <dt>Full name</dt>
                <dd>{profile.full_name}</dd>
                <dt>Birthdate</dt>
                <dd>{profile.birth_date}</dd>
                <dt>Email</dt>
                <dd>{profile.email}</dd>
                <dt>Email status</dt>
                <dd>Confirmed</dd>
            </dl>
        </header>
    );
}
