"use client";

import Link from "next/link";
import { useActionState } from "react";
import { confirmEmail } from "@/app/_actions/authActions";
import { AuthButton } from "@/app/_components/auth/auth-fields";

export function ConfirmForm({ token }: { token: string }) {
    const [state, action, pending] = useActionState(confirmEmail, { message: "" });
    return (
        <>
            <form action={action}>
                <header className="mb-[34px] [&_h1]:mt-0 [&_h1]:mb-3 [&_h1]:font-[550] [&_h1]:text-[34px] [&_h1]:tracking-[-1.3px] [&_h1]:leading-[1.2] [&_h1]:mx-0 [&_p]:text-[var(--muted)] [&_p]:text-[16px] [&_p]:leading-[1.7] [&_p]:m-0 max-[700px]:[&_h1]:text-[32px]">
                    <h1>Confirm your email</h1>
                    <p>One last step to activate your ApplyFlow account.</p>
                </header>
                <input type="hidden" name="token" value={token} />
                {!token && (
                    <p role="alert" className="text-[#1e40af] bg-[#eff6ff] rounded-[6px] text-[16px] leading-[1.6] p-3">
                        This confirmation link is invalid. Sign in to request a new email.
                    </p>
                )}
                {state.message && (
                    <p role="alert" className="text-[#1e40af] bg-[#eff6ff] rounded-[6px] text-[16px] leading-[1.6] p-3">
                        {state.message}
                    </p>
                )}
                <AuthButton disabled={pending || !token}>
                    {pending ? "Confirming…" : "Confirm email address"}
                </AuthButton>
            </form>
            <p className="[&_a:hover]:underline text-center text-[16px] text-[var(--muted)] mt-[27px] mb-0 mx-0 [&_a]:text-[var(--accent)] [&_a]:font-semibold [&_a]:ml-[3px]">
                <Link href="/login">Back to sign in</Link>
            </p>
        </>
    );
}
