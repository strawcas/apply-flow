import type { Metadata } from "next";
import Link from "next/link";
import { AuthLogo } from "./_components/auth/auth-logo";
import Icon, { type IconName } from "./_components/dashboard/dashboard-icon";
import ThemeToggle from "./_components/theme-toggle";
import styles from "./page.module.css";

export const metadata: Metadata = {
    title: "ApplyFlow | Job application tracker",
    description: "Save job postings, track applications, and manage interviews and deadlines with ApplyFlow.",
};

const features: { icon: IconName; title: string; description: string }[] = [
    {
        icon: "applications",
        title: "Applications",
        description: "Save job postings and track application status.",
    },
    {
        icon: "calendar",
        title: "Calendar",
        description: "Manage deadlines, interviews, and follow-ups.",
    },
    {
        icon: "activity",
        title: "Progress",
        description: "View application counts and status.",
    },
];

function Brand({ compact = false }: { compact?: boolean }) {
    return (
        <Link
            href="/"
            className={`inline-flex items-center font-bold tracking-[-1.5px] [&_>_span]:text-[var(--accent-foreground,var(--blue))] ${compact ? "text-[24px]" : "text-[29px] max-[600px]:text-[24px]"}`}
            aria-label="ApplyFlow home"
        >
            <AuthLogo
                className={`object-contain mr-2 max-[600px]:mr-[3px] ${compact ? "w-[33px] h-[33px]" : "w-[43px] h-[43px] max-[600px]:w-[33px] max-[600px]:h-[33px]"}`}
            />
            applyflow<span>.</span>
        </Link>
    );
}

function ProductPreview() {
    return (
        <div
            className="relative [border:1px_solid_var(--border,#d9ded8)] rounded-[14px] bg-[var(--surface,#fff)] shadow-[0_20px_50px_#26392f12] [transform:rotate(-2deg)]"
            aria-label="ApplyFlow dashboard preview"
        >
            <div className="flex items-center justify-between [border-bottom:1px_solid_var(--border,#e7eae4)] text-[9px] tracking-[1.6px] font-semibold text-[var(--text-secondary,#69776e)] py-[14px] px-[18px] [&_>_svg]:w-[15px] max-[850px]:text-[10px]">
                <span
                    className="flex gap-[5px] [&_i]:w-[7px] [&_i]:h-[7px] [&_i]:rounded-full [&_i]:bg-[#dce1db] [&_i:first-child]:bg-[#dbbb9c]"
                    aria-hidden="true"
                >
                    <i />
                    <i />
                    <i />
                </span>
                <span>Dashboard</span>
                <Icon name="goal" />
            </div>
            <div className="p-[25px] max-[1100px]:p-[18px] max-[850px]:p-[25px] max-[600px]:p-[17px]">
                <div className="flex items-center justify-between gap-3 [&_p]:text-[9px] [&_p]:tracking-[1.7px] [&_p]:text-[var(--text-secondary,#68756f)] [&_p]:font-semibold [&_h3]:text-[20px] [&_h3]:leading-[1.4] [&_h3]:tracking-[-.7px] [&_h3]:mt-[5px] [&_h3]:font-semibold [&_h3_span]:text-[var(--accent-foreground,var(--blue))] max-[1100px]:[&_h3]:text-[17px] max-[850px]:[&_h3]:text-[22px] max-[600px]:[&_h3]:text-[18px]">
                    <div>
                        <h3>Applications</h3>
                    </div>
                    <span className="rounded-full bg-[var(--coral-soft,#eedbca)] w-[33px] h-[33px] grid place-items-center text-[13px] shrink-0 max-[1100px]:hidden">
                        J
                    </span>
                </div>
                <div className="grid grid-cols-3 gap-[10px] my-[23px] [&_>_div]:bg-[var(--surface-subtle,#f4f6f2)] [&_>_div]:[border:1px_solid_var(--border,#e8ebe4)] [&_>_div]:rounded-[7px] [&_>_div]:p-[13px] [&_>_div:nth-child(2)]:bg-[var(--blue-soft,#f0f4ff)] [&_>_div:nth-child(2)]:border-[var(--border,#e3e9f8)] [&_>_div:nth-child(3)]:bg-[var(--amber-soft,#f9f4e9)] [&_>_div:nth-child(3)]:border-[var(--border,#f0e9dc)] [&_span]:text-[12px] [&_span]:text-[var(--text-secondary,#5c6964)] [&_strong]:flex [&_strong]:items-center [&_strong]:justify-between [&_strong]:text-[30px] [&_strong]:leading-[1.4] [&_strong]:font-[550] [&_svg]:w-[17px] [&_svg]:text-[var(--text-muted,#74816c)] max-[1100px]:[&_>_div]:p-[10px] max-[850px]:[&_span]:text-[14px] max-[600px]:gap-2 max-[600px]:[&_span]:text-[12px]">
                    <div>
                        <span>Applications</span>
                        <strong>
                            12 <Icon name="applications" />
                        </strong>
                    </div>
                    <div>
                        <span>Interviews</span>
                        <strong>
                            3 <Icon name="calendar" />
                        </strong>
                    </div>
                    <div>
                        <span>Offers</span>
                        <strong>
                            1 <Icon name="goal" />
                        </strong>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2 text-[13px] pt-[1px] pb-[10px] [&_>_span]:text-[10px] [&_>_span]:text-[var(--text-muted,#708075)]">
                    <strong>Recent applications</strong>
                </div>
                <div className="flex items-center gap-[11px] [border-top:1px_solid_var(--border,#edf0ea)] py-[14px] [&_>_div]:flex [&_>_div]:flex-col [&_strong]:text-[13px] [&_strong]:font-semibold [&_div_>_span]:text-[11px] [&_div_>_span]:text-[var(--text-muted,#718079)] max-[850px]:[&_strong]:text-[15px] max-[850px]:[&_div_>_span]:text-[13px] max-[600px]:gap-2 max-[600px]:[&_strong]:text-[13px] max-[600px]:[&_div_>_span]:text-[11px]">
                    <span className="grid place-items-center w-[35px] h-[35px] rounded-[8px] font-[650] shrink-0 text-[var(--purple-text,#7754a2)] bg-[var(--purple-soft,#eee8f6)]">
                        S
                    </span>
                    <div>
                        <strong>Product Designer</strong>
                        <span>Studio North · Remote</span>
                    </div>
                    <span className="ml-auto whitespace-nowrap rounded-[4px] text-[10px] bg-[var(--blue-soft,#edf1ff)] text-[var(--blue-text,#4663a4)] py-1 px-[7px] max-[850px]:text-[12px] max-[600px]:text-[10px] max-[600px]:px-[5px]">
                        Interview
                    </span>
                </div>
                <div className="flex items-center gap-[11px] [border-top:1px_solid_var(--border,#edf0ea)] py-[14px] [&_>_div]:flex [&_>_div]:flex-col [&_strong]:text-[13px] [&_strong]:font-semibold [&_div_>_span]:text-[11px] [&_div_>_span]:text-[var(--text-muted,#718079)] max-[850px]:[&_strong]:text-[15px] max-[850px]:[&_div_>_span]:text-[13px] max-[600px]:gap-2 max-[600px]:[&_strong]:text-[13px] max-[600px]:[&_div_>_span]:text-[11px]">
                    <span className="grid place-items-center w-[35px] h-[35px] rounded-[8px] font-[650] shrink-0 text-[var(--coral-text,#b67541)] bg-[var(--coral-soft,#f9eee4)]">
                        a
                    </span>
                    <div>
                        <strong>UX Designer</strong>
                        <span>Arc & Co. · Hybrid</span>
                    </div>
                    <span className="ml-auto whitespace-nowrap rounded-[4px] text-[10px] bg-[var(--surface-subtle,#f0f1ee)] text-[var(--text-secondary,#627164)] py-1 px-[7px] max-[850px]:text-[12px] max-[600px]:text-[10px] max-[600px]:px-[5px]">
                        Applied
                    </span>
                </div>
                <div className="flex items-center gap-[11px] [border-top:1px_solid_var(--border,#edf0ea)] py-[14px] [&_>_div]:flex [&_>_div]:flex-col [&_strong]:text-[13px] [&_strong]:font-semibold [&_div_>_span]:text-[11px] [&_div_>_span]:text-[var(--text-muted,#718079)] max-[850px]:[&_strong]:text-[15px] max-[850px]:[&_div_>_span]:text-[13px] max-[600px]:gap-2 max-[600px]:[&_strong]:text-[13px] max-[600px]:[&_div_>_span]:text-[11px]">
                    <span className="grid place-items-center w-[35px] h-[35px] rounded-[8px] font-[650] shrink-0 text-[var(--green-text,#537566)] bg-[var(--green-soft,#e8eee8)]">
                        F
                    </span>
                    <div>
                        <strong>Visual Designer</strong>
                        <span>Forma · Remote</span>
                    </div>
                    <span className="ml-auto whitespace-nowrap rounded-[4px] text-[10px] bg-[var(--green-soft,#eaf3e9)] text-[var(--green-text,#487146)] py-1 px-[7px] max-[850px]:text-[12px] max-[600px]:text-[10px] max-[600px]:px-[5px]">
                        Offer received
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function HomePage() {
    return (
        <div
            className="[--ink:var(--text-primary,#223c3b)] [--muted:var(--text-muted,#5f6d6b)] [--blue:#285cda] bg-[var(--page,#fcfbf7)] text-[var(--ink)] [font-family:var(--font-geist-sans),_Arial,_sans-serif] text-[17px] leading-[1.6] overflow-clip box-border -m-2 [&_h2]:text-[clamp(32px,_3vw,_43px)] [&_h2]:leading-[1.2] [&_h2]:tracking-[-1.6px] [&_h2]:font-[550] motion-reduce:[&_a]:[transition:none] motion-reduce:[&_a]:[transform:none]"
            data-ui="landing"
        >
            <a
                className="fixed left-4 -top-25 bg-[var(--surface,#fff)] z-10 py-[10px] px-5 focus:top-4"
                href="#main-content"
            >
                Skip to content
            </a>
            <header className="[width:min(1240px,_calc(100%_-_96px))] min-h-[110px] flex items-center justify-between gap-7 [border-bottom:1px_solid_var(--border,#e4e6de)] mx-auto max-[1100px]:[width:calc(100%_-_64px)] max-[600px]:[width:calc(100%_-_40px)] max-[600px]:min-h-22 max-[600px]:gap-3 max-[400px]:flex-wrap max-[400px]:py-4">
                <Brand />
                <nav
                    className="flex items-center gap-[34px] text-[16px] font-[550] [&_a:hover]:text-[var(--accent-foreground,var(--blue))] max-[1100px]:gap-5 max-[850px]:hidden"
                    aria-label="Main navigation"
                >
                    <a href="#features">Features</a>
                    <a href="#how-it-works">How it works</a>
                </nav>
                <div className="flex items-center gap-5 text-[16px] font-[550] max-[600px]:gap-3 max-[600px]:text-[14px] max-[400px]:w-full max-[400px]:justify-between">
                    <ThemeToggle compact />
                    <Link href="/login" className="hover:text-[var(--accent-foreground,var(--blue))]">
                        Log in
                    </Link>
                    <Link
                        href="/signup"
                        className="inline-flex items-center justify-center gap-5 font-semibold rounded-[8px] min-h-[54px] [transition:background_.18s,_transform_.18s] text-white bg-[var(--blue)] py-[13px] px-[23px] hover:bg-[#194bbb] hover:[transform:translateY(-2px)] max-[600px]:min-h-11 max-[600px]:py-[10px] max-[600px]:px-[14px] max-[600px]:[&_svg]:hidden"
                    >
                        Sign up <Icon name="arrow" />
                    </Link>
                </div>
            </header>
            <main id="main-content">
                <section className="[width:min(1240px,_calc(100%_-_96px))] grid grid-cols-[1.05fr_1fr] items-center gap-15 pt-[94px] pb-[101px] mx-auto [&_h1]:text-[clamp(46px,_4.55vw,_66px)] [&_h1]:leading-[1.1] [&_h1]:tracking-[-3px] [&_h1]:font-[560] [&_h1]:mt-[23px] [&_h1_>_span]:text-[var(--accent-foreground,var(--blue))] min-[1600px]:py-[110px] max-[1100px]:[width:calc(100%_-_64px)] max-[1100px]:gap-8 max-[1100px]:[&_h1]:text-[49px] max-[850px]:grid-cols-[1fr] max-[850px]:pt-15 max-[850px]:pb-[85px] max-[850px]:gap-[58px] max-[850px]:[&_h1]:text-[clamp(46px,_8vw,_66px)] max-[600px]:[width:calc(100%_-_40px)] max-[600px]:pt-[45px] max-[600px]:[&_h1]:tracking-[-2px] max-[600px]:[&_h1]:text-[46px]">
                    <div className="max-[850px]:max-w-150">
                        <h1>
                            Track your
                            <br />
                            <span>job search.</span>
                        </h1>
                        <p className="max-w-[475px] mt-[26px]! text-[18px] leading-[1.8] text-[var(--muted)] max-[850px]:max-w-[550px] max-[600px]:text-[17px]">
                            Save job postings, track applications, and manage deadlines and interviews.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-8 text-[16px] max-[1100px]:gap-[3px] max-[600px]:gap-[7px]">
                            <Link
                                href="/signup"
                                className="inline-flex items-center justify-center gap-5 font-semibold rounded-[8px] min-h-[54px] [transition:background_.18s,_transform_.18s] text-white bg-[var(--blue)] py-[13px] px-[23px] hover:bg-[#194bbb] hover:[transform:translateY(-2px)]"
                            >
                                Get started <Icon name="arrow" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="inline-flex items-center justify-center gap-[10px] font-semibold rounded-[8px] min-h-[54px] [transition:background_.18s,_transform_.18s] py-[13px] px-3 hover:bg-[var(--surface-subtle,#eeeede)]"
                            >
                                How it works <span aria-hidden="true">↗</span>
                            </a>
                        </div>
                    </div>
                    <div className="relative min-w-0 py-5 max-[850px]:max-w-135 max-[850px]:w-full max-[850px]:mx-auto">
                        <div
                            className="absolute w-[570px] h-[570px] rounded-full [border:1px_solid_var(--border,#dde4d9)] bg-[var(--surface-subtle,#edf0e5)] top-[-25px] left-[-10px] after:[content:''] after:absolute after:inset-[26px] after:[border:1px_dashed_#d4ddcd] after:rounded-full max-[850px]:w-[105%] max-[850px]:h-auto max-[850px]:aspect-square"
                            aria-hidden="true"
                        />
                        <span
                            className="absolute text-[88px] leading-[1] text-[#d3a65d] right-[-25px] top-[-31px] [transform:rotate(15deg)] z-1 max-[600px]:-right-1 max-[600px]:text-[67px] max-[600px]:top-[-22px]"
                            aria-hidden="true"
                        >
                            ✳
                        </span>
                        <ProductPreview />
                    </div>
                </section>
                <section
                    className="[width:min(1240px,_calc(100%_-_96px))] pt-[91px] pb-[85px] mx-auto max-[1100px]:[width:calc(100%_-_64px)] max-[600px]:[width:calc(100%_-_40px)] max-[600px]:py-15"
                    id="features"
                >
                    <div className="text-center max-[600px]:text-left">
                        <h2>Features</h2>
                    </div>
                    <div className="grid grid-cols-3 gap-[47px] mt-[51px] max-[850px]:gap-[25px] max-[600px]:grid-cols-[1fr] max-[600px]:gap-8 max-[600px]:mt-[35px]">
                        {features.map((feature, index) => (
                            <article
                                key={feature.title}
                                className="[&_h3]:text-[21px] [&_h3]:font-semibold [&_h3]:tracking-[-.5px] [&_h3]:mb-[10px] [&_p]:text-[var(--muted)] [&_p]:text-[16px] [&_p]:leading-[1.8] max-[600px]:[&_h3]:text-[22px] max-[600px]:[&_p]:text-[17px]"
                            >
                                <span
                                    className="grid place-items-center w-[49px] h-[49px] rounded-[12px] bg-[var(--green-soft,#e9eee2)] text-[var(--green-text,#5b7553)] mb-[21px] [&[data-color='1']]:bg-[var(--blue-soft,#e8eefb)] [&[data-color='1']]:text-[var(--blue-text,#4c68a8)] [&[data-color='2']]:bg-[var(--amber-soft,#f6eddb)] [&[data-color='2']]:text-[var(--amber-text,#94713c)] max-[600px]:mb-[13px]"
                                    data-color={index}
                                >
                                    <Icon name={feature.icon} />
                                </span>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </article>
                        ))}
                    </div>
                </section>
                <section
                    className="[width:min(1240px,_calc(100%_-_96px))] [border-top:1px_solid_var(--border,#e1e5db)] grid grid-cols-[1fr_1.1fr] gap-20 mx-auto py-[79px] [&_h2]:mt-[18px] [&_h2]:mb-[27px] max-[1100px]:[width:calc(100%_-_64px)] max-[1100px]:gap-12 max-[850px]:grid-cols-[1fr] max-[850px]:gap-9 max-[600px]:[width:calc(100%_-_40px)] max-[600px]:py-[55px]"
                    id="how-it-works"
                >
                    <div>
                        <h2>How it works</h2>
                    </div>
                    <ol className="[&_h3]:text-[21px] [&_h3]:font-semibold [&_h3]:tracking-[-.5px] [&_h3]:mb-[5px] [&_p]:text-[var(--muted)] [&_p]:text-[16px] [&_p]:leading-[1.8] list-none m-0 p-0 [&_li]:flex [&_li]:gap-6 [&_li]:[border-bottom:1px_solid_var(--border,#e5e7df)] [&_li]:py-5 [&_li:first-child]:pt-0 [&_li:last-child]:[border:0] [&_li_>_span]:text-[14px] [&_li_>_span]:font-semibold [&_li_>_span]:text-[var(--green-text,#6f856c)] [&_li_>_span]:pt-1 max-[600px]:[&_p]:text-[17px]">
                        {[
                            {
                                title: "Create an account",
                                text: "Sign up with Google.",
                            },
                            {
                                title: "Add job postings",
                                text: "Save jobs or record submitted applications.",
                            },
                            {
                                title: "Track your progress",
                                text: "Update statuses and add calendar events.",
                            },
                        ].map((step, i) => (
                            <li key={step.title}>
                                <span>0{i + 1}</span>
                                <div>
                                    <h3>{step.title}</h3>
                                    <p>{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
                <section aria-labelledby="get-started-heading" className={styles.cta}>
                    <div className={styles.ctaOrbit} aria-hidden="true" />
                    <span className={styles.ctaSpark} aria-hidden="true">
                        ✳
                    </span>
                    <div className={styles.ctaCopy}>
                        <h2 id="get-started-heading" className={styles.ctaHeading}>
                            Your next chapter
                            <br />
                            <span>starts here.</span>
                        </h2>
                    </div>
                    <div className={styles.ctaActions}>
                        <Link href="/signup" className={styles.ctaButton}>
                            Create account <Icon name="arrow" />
                        </Link>
                        <Link href="/login" className={styles.ctaLogin}>
                            Log in
                        </Link>
                    </div>
                </section>
            </main>
            <footer className="[width:min(1240px,_calc(100%_-_96px))] flex items-center justify-between gap-6 mx-auto py-8 [&_>_p]:text-[13px] [&_>_p]:text-[var(--muted)] [&_>_span]:text-[13px] [&_>_span]:text-[var(--muted)] max-[1100px]:[width:calc(100%_-_64px)] max-[850px]:flex-wrap max-[850px]:[&_>_p]:hidden max-[600px]:[width:calc(100%_-_40px)] max-[600px]:gap-[14px] max-[600px]:[&_>_span]:text-[12px]">
                <Brand compact />
                <span>© {new Date().getFullYear()} ApplyFlow</span>
            </footer>
        </div>
    );
}
