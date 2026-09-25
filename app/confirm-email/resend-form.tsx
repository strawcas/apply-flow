"use client";

import { useActionState } from "react";
import { resendConfirmation, signOut } from "@/app/_actions/authActions";
import { AuthButton } from "@/app/_components/auth/auth-fields";

export function ResendForm() {
    const [state, action, pending] = useActionState(resendConfirmation, { message: "" });
    return (
        <>
            <form action={action}>
                {state.message && (
                    <p
                        role="status"
                        className="text-[var(--blue-text,#1e40af)] bg-[var(--blue-soft,#eff6ff)] rounded-[6px] text-[16px] leading-[1.6] p-3"
                    >
                        {state.message}
                    </p>
                )}
                <AuthButton disabled={pending}>{pending ? "Sending…" : "Resend confirmation email"}</AuthButton>
            </form>
            <form
                action={signOut}
                className="[&_a:hover]:underline text-center text-[16px] text-[var(--muted)] mt-[27px] mb-0 mx-0 [&_a]:text-[var(--accent-foreground,var(--accent))] [&_a]:font-semibold [&_a]:ml-[3px]"
            >
                <button
                    type="submit"
                    className="[border:0] bg-transparent text-[var(--accent-foreground,var(--accent))] font-[550]! cursor-pointer py-2 px-0 hover:underline"
                >
                    Sign out
                </button>
            </form>
        </>
    );
}
