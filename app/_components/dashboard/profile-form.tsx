"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveProfile, type ProfileResult, type ProfileValues } from "@/app/_actions/profileActions";
import Icon from "./dashboard-icon";

const inputClass =
    "mt-2 block min-h-12 w-full min-w-0 rounded-lg border border-solid border-[#dce4ef] bg-white px-3.5 py-3 text-[15px] text-[var(--ink)] transition-colors focus:border-[#2563eb] disabled:bg-[#f7f9fc] disabled:text-[#64748b]";

export default function ProfileForm({ values, today }: { values: ProfileValues; today: string }) {
    const [saved, setSaved] = useState(values);
    const [draft, setDraft] = useState(values);
    const [result, setResult] = useState<ProfileResult | null>(null);
    const [pending, startTransition] = useTransition();
    const changed = draft.fullName !== saved.fullName || draft.birthDate !== saved.birthDate;

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setResult(null);
        startTransition(async () => {
            try {
                const response = await saveProfile(formData);
                setResult(response);
                if (response.success) {
                    setSaved(response.values);
                    setDraft(response.values);
                }
            } catch {
                setResult({ success: false, message: "We couldn't save your changes. Please try again." });
            }
        });
    }

    function edit(field: keyof ProfileValues, value: string) {
        setDraft((current) => ({ ...current, [field]: value }));
        setResult(null);
    }

    return (
        <section
            className="overflow-hidden rounded-xl border border-solid border-[var(--line)] bg-white"
            aria-labelledby="personal-information"
        >
            <div className="border-0 border-b border-solid border-[var(--line)] px-7 py-6 max-[600px]:px-5">
                <h2 id="personal-information" className="m-0 text-[18px] font-semibold tracking-[-0.3px]">
                    Personal information
                </h2>
                <p className="mb-0 mt-2 text-[14px] leading-6 text-[#64748b]">
                    A few details that make this space yours.
                </p>
            </div>
            <form onSubmit={submit} aria-busy={pending}>
                <fieldset disabled={pending} className="m-0 min-w-0 border-0 p-7 max-[600px]:p-5">
                    <legend className="sr-only">Edit your personal information</legend>
                    <div className="grid grid-cols-2 gap-6 max-[1000px]:grid-cols-1">
                        <div>
                            <label htmlFor="profile-full-name" className="text-[14px] font-medium">
                                Full name
                            </label>
                            <input
                                id="profile-full-name"
                                name="fullName"
                                autoComplete="name"
                                required
                                maxLength={100}
                                value={draft.fullName}
                                onChange={(event) => edit("fullName", event.target.value)}
                                className={inputClass}
                                aria-describedby="full-name-help"
                            />
                            <p id="full-name-help" className="mb-0 mt-2 text-[12px] leading-5 text-[#64748b]">
                                The name you use on ApplyFlow.
                            </p>
                        </div>
                        <div>
                            <label htmlFor="profile-birth-date" className="text-[14px] font-medium">
                                Birthdate
                            </label>
                            <input
                                id="profile-birth-date"
                                name="birthDate"
                                type="date"
                                autoComplete="bday"
                                required
                                min="1900-01-01"
                                max={today}
                                value={draft.birthDate}
                                onChange={(event) => edit("birthDate", event.target.value)}
                                className={inputClass}
                                aria-describedby="birth-date-help"
                            />
                            <p id="birth-date-help" className="mb-0 mt-2 text-[12px] leading-5 text-[#64748b]">
                                Your date of birth, as provided at signup.
                            </p>
                        </div>
                    </div>
                </fieldset>
                <div className="flex flex-wrap items-center justify-between gap-4 border-0 border-t border-solid border-[var(--line)] bg-[#fbfcfe] px-7 py-5 max-[600px]:px-5">
                    <div className="min-w-0 flex-1 text-[13px] leading-5" aria-live="polite" aria-atomic="true">
                        {result ? (
                            <p
                                role={result.success ? "status" : "alert"}
                                className={`m-0 ${result.success ? "text-[#21734d]" : "text-[#b42318]"}`}
                            >
                                {result.message}
                            </p>
                        ) : (
                            <span className="text-[#64748b]">
                                {pending
                                    ? "Saving your changes…"
                                    : changed
                                      ? "You have unsaved changes."
                                      : "Your details are up to date."}
                            </span>
                        )}
                    </div>
                    <div className="flex gap-3 max-[600px]:w-full">
                        <button
                            type="button"
                            disabled={!changed || pending}
                            onClick={() => {
                                setDraft(saved);
                                setResult(null);
                            }}
                            className="min-h-11 rounded-lg border border-solid border-[#dce4ef] bg-white px-4 py-2.5 text-[14px] font-medium text-[#52637d] hover:enabled:bg-[#f1f5f9] disabled:cursor-default disabled:opacity-50 max-[600px]:flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!changed || pending}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-solid border-transparent bg-[var(--accent)] px-4 py-2.5 text-[14px] font-medium text-white hover:enabled:bg-[#1d4ed8] disabled:cursor-default disabled:opacity-50 max-[600px]:flex-1 [&_svg]:h-4 [&_svg]:w-4"
                        >
                            <Icon name="check" />
                            {pending ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}
