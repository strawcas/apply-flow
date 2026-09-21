import type { Metadata } from "next";
import Link from "next/link";
import { AuthLogo } from "./_components/auth/auth-logo";
import Icon, { type IconName } from "./_components/dashboard/dashboard-icon";
import styles from "./landing.module.css";

export const metadata: Metadata = {
    title: "ApplyFlow — Your next chapter starts here",
    description: "Bring a little clarity to your job search. Organize applications, keep track of interviews, and see your progress with ApplyFlow.",
};

const features: { icon: IconName; title: string; description: string }[] = [
    { icon: "applications", title: "Everything in one place", description: "Keep your opportunities, application details, and next steps together. Goodbye, scattered spreadsheets." },
    { icon: "calendar", title: "Stay one step ahead", description: "Give your interviews and follow-ups a home, so you can focus on showing up prepared." },
    { icon: "activity", title: "See how far you’ve come", description: "Get a clearer picture of your search, from your very first application to your next big opportunity." },
];

function Brand() {
    return <Link href="/" className={styles.brand} aria-label="ApplyFlow home"><AuthLogo className={styles.logo} />applyflow<span>.</span></Link>;
}

function ProductPreview() {
    return (
        <div className={styles.preview} aria-label="Illustrative preview of the ApplyFlow dashboard">
            <div className={styles.windowBar}><span className={styles.windowDots} aria-hidden="true"><i /><i /><i /></span><span>YOUR NEXT CHAPTER, ORGANIZED</span><Icon name="goal" /></div>
            <div className={styles.previewBody}>
                <div className={styles.previewHeading}><div><p>LET’S MAKE MOVES</p><h3>Your job search, at a glance<span>.</span></h3></div><span className={styles.avatar}>J</span></div>
                <div className={styles.stats}>
                    <div><span>Applications</span><strong>12 <Icon name="applications" /></strong></div>
                    <div><span>Interviews</span><strong>3 <Icon name="calendar" /></strong></div>
                    <div><span>Offers</span><strong>1 <Icon name="goal" /></strong></div>
                </div>
                <div className={styles.tableTitle}><strong>Recent applications</strong><span>Looking good <span aria-hidden="true">↗</span></span></div>
                <div className={styles.application}><span className={`${styles.company} ${styles.purple}`}>S</span><div><strong>Product Designer</strong><span>Studio North · Remote</span></div><span className={styles.interview}>Interview</span></div>
                <div className={styles.application}><span className={`${styles.company} ${styles.orange}`}>a</span><div><strong>UX Designer</strong><span>Arc & Co. · Hybrid</span></div><span className={styles.applied}>Applied</span></div>
                <div className={styles.application}><span className={`${styles.company} ${styles.green}`}>F</span><div><strong>Visual Designer</strong><span>Forma · Remote</span></div><span className={styles.offer}>Offer received</span></div>
                <div className={styles.previewNote}><span className={styles.checkCircle}><Icon name="check" /></span><span>A little progress, every day.<br /><strong>You’re moving in the right direction.</strong></span></div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <div className={styles.page}>
            <a className={styles.skipLink} href="#main-content">Skip to content</a>
            <header className={styles.header}>
                <Brand />
                <nav className={styles.navigation} aria-label="Main navigation"><a href="#features">Why ApplyFlow</a><a href="#how-it-works">How it works</a></nav>
                <div className={styles.authLinks}><Link href="/login" className={styles.login}>Log in</Link><Link href="/signup" className={styles.smallButton}>Sign up <Icon name="arrow" /></Link></div>
            </header>
            <main id="main-content">
                <section className={styles.hero}>
                    <div className={styles.heroCopy}>
                        <p className={styles.eyebrow}><span /> A LITTLE CLARITY. A LOT OF POSSIBILITY.</p>
                        <h1>Your next chapter.<br /><span>A little more<br className={styles.desktopBreak} /> organized.</span></h1>
                        <p className={styles.description}>Big career dreams. A lot of open tabs. Bring your applications, interviews, and next steps together in one calm space.</p>
                        <div className={styles.heroActions}><Link href="/signup" className={styles.primaryButton}>Start your next chapter <Icon name="arrow" /></Link><a href="#how-it-works" className={styles.secondaryButton}>See how it works <span aria-hidden="true">↗</span></a></div>
                        <p className={styles.heroFootnote}><Icon name="check" /> Less keeping track. More moving forward.</p>
                    </div>
                    <div className={styles.visual}><div className={styles.orbit} aria-hidden="true" /><span className={styles.sparkle} aria-hidden="true">✳</span><ProductPreview /><div className={styles.floatingNote}><span aria-hidden="true">✦</span> A fresh start looks good on you.</div><span className={styles.previewLabel}>A glimpse of your future workspace · Sample data</span></div>
                </section>
                <div className={styles.benefitStrip}><span>Built for the journey.<br /><strong>And the person behind it.</strong></span><span><Icon name="overview" /> Less clutter</span><span><Icon name="goal" /> More focus</span><span><Icon name="activity" /> Real momentum</span></div>
                <section className={styles.features} id="features"><div className={styles.sectionHeading}><p className={styles.eyebrow}>MAKE ROOM FOR WHAT’S NEXT</p><h2>A job search with a little<br />more breathing room.</h2><p>You handle the possibilities. We help you keep them organized.</p></div><div className={styles.featureGrid}>{features.map((feature, index) => <article key={feature.title} className={styles.feature}><span className={styles.featureIcon} data-color={index}><Icon name={feature.icon} /></span><h3>{feature.title}</h3><p>{feature.description}</p></article>)}</div></section>
                <section className={styles.how} id="how-it-works"><div><p className={styles.eyebrow}>FROM OVERWHELMED TO ON TRACK</p><h2>Your next move,<br />in three simple steps.</h2><Link href="/signup" className={styles.textLink}>Let’s get you started <Icon name="arrow" /></Link></div><ol className={styles.steps}>{[{ title: "Make yourself at home", text: "Create your account and give your job search a fresh start." }, { title: "Bring your opportunities together", text: "Add the roles you’re pursuing and keep the important details close." }, { title: "Keep moving forward", text: "Update your progress and make space for the next opportunity." }].map((step, i) => <li key={step.title}><span>0{i + 1}</span><div><h3>{step.title}</h3><p>{step.text}</p></div></li>)}</ol></section>
                <section className={styles.finalCta}><span className={styles.ctaStar} aria-hidden="true">✳</span><p className={styles.eyebrow}>HERE’S TO WHAT COMES NEXT</p><h2>Your future is full of possibilities.<br />Let’s make room for them.</h2><Link href="/signup" className={styles.primaryButton}>Create your account <Icon name="arrow" /></Link><p>Already have an account? <Link href="/login">Log in</Link></p></section>
            </main>
            <footer className={styles.footer}><Brand /><p>A little structure for your next big thing.</p><span>© {new Date().getFullYear()} ApplyFlow</span></footer>
        </div>
    );
}
