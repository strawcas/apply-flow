"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthLogo } from "@/app/_components/auth/auth-logo";
import Icon, { type IconName } from "./dashboard-icon";
import { signOut } from "@/app/_actions/authActions";
import ThemeToggle from "@/app/_components/theme-toggle";

const navigation: { href: string; label: string; icon: IconName }[] = [
    { href: "/dashboard", label: "Dashboard", icon: "overview" },
    { href: "/applications", label: "Applications", icon: "applications" },
    { href: "/calendar", label: "Calendar", icon: "calendar" },
    { href: "/profile", label: "Profile", icon: "profile" },
    { href: "/settings", label: "Settings", icon: "settings" },
];

function SignOutButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className="flex items-center gap-[13px] w-full min-h-12 [border:1px_solid_var(--line)] rounded-[7px] bg-[var(--surface-subtle,#f8fafc)] text-[var(--text-muted,#66758c)] font-normal text-left [transition:background-color_150ms_ease,_border-color_150ms_ease,_color_150ms_ease] py-[13px] px-[15px] [&_svg]:shrink-0 [&:hover:not(:disabled)]:bg-[var(--red-soft,#fff1f2)] [&:hover:not(:disabled)]:border-[var(--border,#ffe4e6)] [&:hover:not(:disabled)]:text-[var(--red-text,#be123c)] [&:active:not(:disabled)]:bg-[var(--red-soft,#ffe4e6)] disabled:cursor-wait disabled:opacity-[0.65] motion-reduce:[transition:none]"
            disabled={pending}
        >
            <Icon name="sign-out" />
            <span aria-live="polite">{pending ? "Signing out…" : "Sign out"}</span>
        </button>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <aside
            className="w-[242px] shrink-0 bg-[var(--surface,#fff)] [border-right:1px_solid_var(--line)] sticky top-0 h-svh pt-[33px] pb-5 flex flex-col px-5 max-[1200px]:w-[214px] max-[1200px]:px-[14px] max-[800px]:w-[190px] max-[600px]:w-full max-[600px]:h-auto max-[600px]:relative max-[600px]:[border-right:0] max-[600px]:[border-bottom:1px_solid_var(--line)] max-[600px]:py-4 max-[600px]:px-5"
            aria-label="Sidebar"
        >
            <div className="flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center text-[25px] font-[650] tracking-[-1.2px] pl-2 [&_>_span]:text-[var(--blue-text,#3975eb)] max-[800px]:text-[21px] max-[800px]:pl-0"
                    onClick={() => setOpen(false)}
                >
                    <AuthLogo className="w-9 h-9 object-contain mr-[9px] max-[800px]:w-[30px] max-[800px]:h-[30px]" />
                    applyflow<span>.</span>
                </Link>
                <button
                    type="button"
                    className="hidden [border:1px_solid_var(--line)] bg-[var(--surface,#fff)] text-[var(--ink)] rounded-[6px] p-2 max-[600px]:grid max-[600px]:place-items-center"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    aria-controls="sidebar-navigation"
                    aria-label={open ? "Close navigation" : "Open navigation"}
                >
                    <Icon name={open ? "close" : "menu"} />
                </button>
            </div>
            <nav
                id="sidebar-navigation"
                aria-label="Main navigation"
                className={`flex flex-1 flex-col ${open ? "max-[600px]:flex" : "max-[600px]:hidden"}`}
            >
                <p className="text-[var(--text-muted,#97a1b2)] tracking-[1.7px] text-[10px] font-semibold mt-[51px] mb-[15px] mx-[15px] max-[600px]:mt-[25px]">
                    WORKSPACE
                </p>
                <ul className="list-none grid gap-[7px] m-0 p-0">
                    {navigation.map((item) => {
                        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={`flex items-center gap-[13px] rounded-[7px] font-medium py-[14px] px-[15px] ${active ? "text-[var(--accent-foreground,var(--accent))] bg-[var(--blue-soft,#edf3ff)]" : "text-[var(--text-muted,#708098)] hover:bg-[var(--surface-hover,#f5f8fe)] hover:text-[var(--accent-foreground,var(--accent))]"}`}
                                    onClick={() => setOpen(false)}
                                >
                                    <Icon name={item.icon} />
                                    {item.label}
                                    {active && (
                                        <span className="ml-auto w-[6px] h-[6px] rounded-full bg-[var(--accent)]" />
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <div className="mt-auto pt-6 before:[content:''] before:block before:h-[1px] before:mb-4 before:bg-[var(--line)]">
                    <ThemeToggle />
                    <form action={signOut} className="mt-3">
                        <SignOutButton />
                    </form>
                </div>
            </nav>
        </aside>
    );
}
