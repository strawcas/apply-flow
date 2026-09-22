import type { ReactNode } from "react";
import Sidebar from "@/app/_components/dashboard/sidebar";
import styles from "@/app/_components/dashboard/dashboard.module.css";
import { requireAccount } from "@/app/_lib/require-account";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    await requireAccount();
    return (
        <div className={styles.layout}>
            <a href="#main-content" className={styles.skipLink}>
                Skip to content
            </a>
            <Sidebar />
            <main id="main-content" className={styles.main} tabIndex={-1}>
                {children}
            </main>
        </div>
    );
}
