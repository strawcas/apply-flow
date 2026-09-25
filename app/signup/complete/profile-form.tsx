"use client";

import { useActionState } from "react";
import { completeSignup, signOut } from "@/app/_actions/authActions";
import { AuthButton, AuthField } from "@/app/_components/auth/auth-fields";

export function ProfileForm({ email, fullName, today }: { email: string; fullName: string; today: string }) {
    const [state, action, pending] = useActionState(completeSignup, { message: "" });
    return (
        <>
            <form action={action}>
                <header className="mb-[34px] [&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:font-[550] [&_h1]:text-[34px] [&_h1]:tracking-[-1.3px] [&_h1]:leading-[1.2] [&_h1]:mx-0 [&_p]:text-[var(--muted)] [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p]:m-0 max-[700px]:[&_h1]:text-[32px]">
                    <h1>Finish signing up</h1>
                    <p>Add your details. We’ll then send a confirmation link to your Google email.</p>
                </header>
                <AuthField
                    id="full-name"
                    name="fullName"
                    label="Full name"
                    autoComplete="name"
                    defaultValue={fullName}
                    maxLength={100}
                    pattern={".*\\S.*"}
                    required
                />
                <AuthField
                    id="birth-date"
                    name="birthDate"
                    label="Birthdate"
                    type="date"
                    autoComplete="bday"
                    min="1900-01-01"
                    max={today}
                    required
                />
                <AuthField id="email" label="Google email" type="email" value={email} readOnly />
                {state.message && (
                    <p role="alert" className="text-[var(--blue-text,#1e40af)] bg-[var(--blue-soft,#eff6ff)] rounded-[6px] text-[16px] leading-[1.6] p-3">
                        {state.message}
                    </p>
                )}
                <AuthButton disabled={pending}>{pending ? "Creating your account…" : "Create account"}</AuthButton>
            </form>
            <form
                action={signOut}
                className="[&_a:hover]:underline text-center text-[16px] text-[var(--muted)] mt-[27px] mb-0 mx-0 [&_a]:text-[var(--accent-foreground,var(--accent))] [&_a]:font-semibold [&_a]:ml-[3px]"
            >
                <button
                    type="submit"
                    className="[border:0] bg-transparent text-[var(--accent-foreground,var(--accent))] font-[550]! cursor-pointer py-2 px-0 hover:underline"
                >
                    Use a different Google account
                </button>
            </form>
        </>
    );
}
