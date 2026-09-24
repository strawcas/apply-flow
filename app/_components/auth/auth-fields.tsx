"use client";

import { useState, type ComponentProps } from "react";

type AuthFieldProps = ComponentProps<"input"> & { label: string; id: string };

export function AuthField({ label, id, type = "text", ...props }: AuthFieldProps) {
    const [visible, setVisible] = useState(false);
    const isPassword = type === "password";
    return (
        <div className="mb-[21px] [&_>_label]:block [&_>_label]:text-[14px] [&_>_label]:font-[550] [&_>_label]:mb-[9px]">
            <label htmlFor={id}>{label}</label>
            <div className="relative">
                <input
                    {...props}
                    id={id}
                    type={isPassword && visible ? "text" : type}
                    className={`w-full h-[50px] [border:1px_solid_#d7e0ee] rounded-[7px] bg-white text-[var(--ink)] text-[16px] [transition:border-color_150ms] py-0 pl-[15px] placeholder:text-[#748399] hover:border-[#93add1] ${isPassword ? "pr-[50px] [&::-ms-reveal]:hidden" : "pr-[15px]"}`}
                />
                {isPassword && (
                    <button
                        className="absolute [inset:3px_3px_3px_auto] w-11 [border:0] bg-transparent text-[#64748b] cursor-pointer grid place-items-center rounded-[4px]"
                        type="button"
                        onClick={() => setVisible(!visible)}
                        aria-label={visible ? "Hide password" : "Show password"}
                        aria-pressed={visible}
                        aria-controls={id}
                        tabIndex={-1}
                    >
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            aria-hidden="true"
                        >
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                            <circle cx="12" cy="12" r="3" />
                            {visible && <path d="m3 3 18 18" />}
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

export function AuthButton({ children, ...props }: ComponentProps<"button">) {
    return (
        <button
            type="submit"
            {...props}
            className="w-full min-h-[50px] flex items-center justify-center gap-3 [border:1px_solid_var(--accent)] rounded-[7px] bg-[var(--accent)] text-white text-[16px]! font-[550]! cursor-pointer [transition:background_150ms] hover:bg-[#1d4ed8] [&_span]:text-[19px] [&_span]:font-normal disabled:opacity-[.6] disabled:cursor-not-allowed"
        >
            {children}
            <span aria-hidden="true">↗</span>
        </button>
    );
}
