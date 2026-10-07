import Link from "next/link";
import Icon from "@/app/_components/dashboard/dashboard-icon";
import ProfileForm from "@/app/_components/dashboard/profile-form";
type ProfileDetails = { full_name: string; birth_date: string; email: string; email_confirmed_at: Date | null };

export default function ProfileOverview({ profile }: { profile: ProfileDetails }) {
    const initials = profile.full_name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .filter((_, index, parts) => index === 0 || index === parts.length - 1)
        .map((part) => Array.from(part)[0])
        .join("")
        .toLocaleUpperCase();
    const confirmed = Boolean(profile.email_confirmed_at);

    return (
        <div className="w-full min-w-0 pb-4 text-[15px] leading-[1.5]">
            <header className="mb-8">
                <h1 className="m-0 text-[34px] font-semibold leading-[1.25] tracking-[-1px] max-[600px]:text-[28px]">
                    Profile
                </h1>
            </header>

            <section
                className="relative mb-7 overflow-hidden rounded-xl border border-solid border-[var(--line)] bg-[var(--surface,#fff)]"
                aria-labelledby="profile-name"
            >
                <div className="relative h-24 overflow-hidden bg-[var(--blue-soft,#eaf1ff)]" aria-hidden="true">
                    <div className="absolute -right-8 -top-32 h-72 w-72 rounded-full border border-solid border-[#cddcf8]" />
                    <div className="absolute -right-20 -top-44 h-96 w-96 rounded-full border border-solid border-[var(--border,#d8e4fa)]" />
                    <div className="absolute left-0 top-0 h-full w-full bg-linear-to-r from-[var(--blue-soft,#edf3ff)] via-transparent to-transparent" />
                </div>
                <div className="relative flex flex-wrap items-end justify-between gap-5 px-7 pb-7 max-[600px]:px-5">
                    <div className="min-w-0">
                        <div
                            className="-mt-10 mb-4 grid h-[88px] w-[88px] place-items-center rounded-[22px] border-4 border-solid border-[var(--surface,#fff)] bg-[#2563eb] text-[28px] font-semibold tracking-[-1px] text-white shadow-sm"
                            aria-hidden="true"
                        >
                            {initials}
                        </div>
                        <h2
                            id="profile-name"
                            className="m-0 text-[25px] font-semibold leading-tight tracking-[-0.6px] [overflow-wrap:anywhere]"
                        >
                            {profile.full_name}
                        </h2>
                        <p className="mb-0 mt-2 text-[14px] text-[var(--text-muted,#64748b)] [overflow-wrap:anywhere]">
                            {profile.email}
                        </p>
                    </div>
                    <span
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium [&_svg]:h-4 [&_svg]:w-4 ${confirmed ? "bg-[var(--green-soft,#edf8f1)] text-[var(--green-text,#21734d)]" : "bg-[var(--amber-soft,#fff7e6)] text-[var(--amber-text,#946200)]"}`}
                    >
                        <Icon name={confirmed ? "check" : "profile"} />
                        {confirmed ? "Verified account" : "Email unconfirmed"}
                    </span>
                </div>
            </section>

            <div className="grid grid-cols-[minmax(0,1fr)_300px] items-start gap-7 max-[1200px]:grid-cols-1">
                <div className="grid min-w-0 gap-7">
                    <ProfileForm
                        values={{ fullName: profile.full_name, birthDate: profile.birth_date }}
                        today={new Date().toISOString().slice(0, 10)}
                    />

                    <section
                        className="rounded-xl border border-solid border-[var(--line)] bg-[var(--surface,#fff)] p-7 max-[600px]:p-5"
                        aria-labelledby="connected-account"
                    >
                        <h2 id="connected-account" className="mt-0 mb-5 text-[18px] font-semibold tracking-[-0.3px]">
                            Connected account
                        </h2>
                        <div className="flex items-center gap-4 rounded-lg border border-solid border-[var(--line)] p-4 max-[600px]:flex-wrap">
                            <span
                                className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-solid border-[var(--line)] bg-[var(--surface,#fff)]"
                                aria-hidden="true"
                            >
                                <svg width="22" height="22" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.58-4.12H3.08v2.6A10 10 0 0 0 12 22Z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M6.42 13.93a6 6 0 0 1 0-3.86v-2.6H3.08a10 10 0 0 0 0 9.06l3.34-2.6Z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.95c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.92 5.47l3.34 2.6A5.99 5.99 0 0 1 12 5.95Z"
                                    />
                                </svg>
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="m-0 text-[14px] font-semibold">Google</p>
                                <p className="mb-0 mt-1 text-[13px] text-[var(--text-muted,#64748b)] [overflow-wrap:anywhere]">
                                    {profile.email}
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--green-text,#21734d)] [&_svg]:h-4 [&_svg]:w-4">
                                <Icon name="check" />
                                Connected
                            </span>
                        </div>
                        <p className="mb-0 mt-4 text-[12px] leading-5 text-[var(--text-muted,#64748b)]">
                            Your sign-in email is linked to Google and cannot be edited here.
                        </p>
                    </section>
                </div>

                <aside
                    className="grid gap-6 max-[1200px]:grid-cols-2 max-[800px]:grid-cols-1"
                    aria-label="Profile information"
                >
                    <section className="rounded-xl border border-solid border-[var(--line)] bg-[var(--surface,#fff)] p-6">
                        <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[var(--blue-soft,#edf3ff)] text-[var(--blue-text,#2563eb)]">
                            <Icon name="profile" />
                        </span>
                        <h2 className="m-0 text-[16px] font-semibold">Profile details</h2>
                        <p className="mb-0 mt-3 text-[14px] leading-6 text-[var(--text-muted,#64748b)]">
                            Profile changes only affect your ApplyFlow account.
                        </p>
                    </section>
                    <section className="rounded-xl bg-[var(--brand-panel,#193e79)] p-6 text-white">
                        <span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[#ffffff12] text-[#c5d9ff]">
                            <Icon name="applications" />
                        </span>
                        <h2 className="m-0 text-[20px] font-medium leading-7 tracking-[-0.4px]">Applications</h2>
                        <Link
                            href="/applications"
                            className="mt-4 inline-flex min-h-11 items-center gap-2 text-[14px] font-medium text-white hover:underline"
                        >
                            View applications <Icon name="arrow" />
                        </Link>
                    </section>
                </aside>
            </div>
        </div>
    );
}
