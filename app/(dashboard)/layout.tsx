import type { ReactNode } from "react";
import Sidebar from "@/app/_components/dashboard/sidebar";
import { session } from "@/app/_lib/session";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    await session("/login");

    return (
        <div
            className="[--ink:var(--text-primary,#1c2d49)] [--muted:var(--text-muted,#77849a)] [--line:var(--border,#e8edf4)] [--accent:#2563eb] min-h-svh flex bg-[var(--page,#f7f9fc)] text-[var(--ink)] [font-family:var(--font-geist-sans),_Arial,_sans-serif] text-[13px] antialiased box-border -m-2 max-[600px]:flex-col"
            data-ui="dashboard"
        >
            <a
                href="#main-content"
                className="absolute w-[1px] h-[1px] overflow-hidden [clip-path:inset(50%)] whitespace-nowrap focus:z-20 focus:top-[10px] focus:left-[10px] focus:w-auto focus:h-auto focus:[clip-path:none] focus:bg-[var(--surface,#fff)] focus:text-[var(--accent-foreground,var(--accent))] focus:p-[15px]"
            >
                Skip to content
            </a>
            <Sidebar />
            <main
                id="main-content"
                className="flex-1 min-w-0 w-full max-w-[1510px] pt-[38px] pb-6 my-0 mx-auto px-10 min-[1600px]:pt-12 max-[1200px]:px-[26px] max-[600px]:pt-[26px] max-[600px]:pb-5 max-[600px]:px-[18px]"
                tabIndex={-1}
            >
                {children}
            </main>
        </div>
    );
}
