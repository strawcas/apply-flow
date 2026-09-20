import Link from "next/link";
import type { ReactNode } from "react";
import { AuthLogo } from "./auth-logo";
import styles from "./auth.module.css";

/** Shared frame for login and signup; supply the relevant form as children. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.shell}>
      <aside className={styles.story} aria-label="About ApplyFlow">
        <Link href="/" className={styles.brand}>
          <AuthLogo className={styles.brandIcon} />ApplyFlow<span className={styles.brandDot}>.</span>
        </Link>
        <div className={styles.storyContent}>
          <p className={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</p>
          <h2>A little more focus.<br />A lot more <span>possibility.</span></h2>
          <p className={styles.storyDescription}>Keep your applications in order and your next opportunity in sight. One place to move your career forward.</p>
          <div className={styles.illustration} aria-hidden="true">
            <div className={styles.trackHeader}><span>YOUR NEXT MOVE</span><span>•••</span></div>
            <div className={styles.application}>
              <span className={styles.companyIcon}>✳</span>
              <div><strong>Product Designer</strong><span>Your next opportunity</span></div>
              <span className={styles.status}>In progress</span>
            </div>
            <div className={styles.progress}><i /><i /><i /></div>
            <div className={styles.steps}><span>Applied</span><span>Interview</span><span>Offer</span></div>
            <div className={styles.note}><span>✓</span> Every step is a step forward.</div>
          </div>
        </div>
        <p className={styles.storyFooter}>Less juggling. More moving forward.</p>
      </aside>
      <section className={styles.formPanel} aria-label="Your account">
        <div className={styles.formContainer}>{children}</div>
        <p className={styles.footer}>Your next opportunity is out there. Let’s get you there.</p>
      </section>
    </main>
  );
}
