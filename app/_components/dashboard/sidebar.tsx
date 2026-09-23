"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthLogo } from "@/app/_components/auth/auth-logo";
import Icon, { type IconName } from "./dashboard-icon";
import styles from "./dashboard.module.css";
import { signOut } from "@/app/_actions/auth";

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
        <button type="submit" className={styles.signOutButton} disabled={pending}>
            <Icon name="sign-out" />
            <span aria-live="polite">{pending ? "Signing out…" : "Sign out"}</span>
        </button>
    );
}

export default function Sidebar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <aside className={styles.sidebar} aria-label="Sidebar">
            <div className={styles.brandRow}>
                <Link href="/" className={styles.brand} onClick={() => setOpen(false)}>
                    <AuthLogo className={styles.logo} />
                    applyflow<span>.</span>
                </Link>
                <button
                    type="button"
                    className={styles.menuButton}
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
                className={`${styles.sidebarContent} ${open ? styles.sidebarOpen : ""}`}
            >
                <p className={styles.navLabel}>WORKSPACE</p>
                <ul className={styles.navigation}>
                    {navigation.map((item) => {
                        const active =
                            pathname === item.href || pathname.startsWith(`${item.href}/`);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    aria-current={active ? "page" : undefined}
                                    className={active ? styles.activeNav : undefined}
                                    onClick={() => setOpen(false)}
                                >
                                    <Icon name={item.icon} />
                                    {item.label}
                                    {active && <span className={styles.activeDot} />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
                <form action={signOut} className={styles.signOutForm}>
                    <SignOutButton />
                </form>
            </nav>
        </aside>
    );
}
