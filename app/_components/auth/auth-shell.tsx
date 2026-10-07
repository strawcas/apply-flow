import Link from "next/link";
import type { ReactNode } from "react";
import { AuthLogo } from "./auth-logo";

/** Shared frame for login and signup; supply the relevant form as children. */
export function AuthShell({ children }: { children: ReactNode }) {
    return (
        <main
            className="[--ink:var(--text-primary,#172b4d)] [--muted:var(--text-muted,#64748b)] [--accent:#2563eb] absolute inset-0 min-h-svh grid grid-cols-[1fr_1fr] bg-[var(--page,#f8faff)] text-[var(--ink)] [font-family:var(--font-geist-sans),_Arial,_sans-serif] antialiased box-border max-[700px]:grid-cols-[1fr] max-[700px]:grid-rows-[auto_1fr]"
            data-ui="auth"
        >
            <aside
                className="bg-[var(--brand-panel,#173b78)] text-[#f8faff] flex flex-col py-12 px-[11%] [&_h2]:text-[clamp(32px,_3.6vw,_54px)] [&_h2]:leading-[1.16] [&_h2]:font-medium [&_h2]:tracking-[-2px] [&_h2]:m-0 [&_h2_span]:text-[#bfdbfe] min-[1500px]:px-[15%] max-[1050px]:py-9 max-[1050px]:px-[8%] max-[700px]:py-[25px] max-[700px]:px-7"
                aria-label="About ApplyFlow"
            >
                <Link
                    href="/"
                    className="inline-flex items-center self-start text-[24px] font-[650] tracking-[-1px] max-[700px]:text-[21px]"
                >
                    <AuthLogo className="block w-12 h-12 object-contain mr-[10px]" />
                    ApplyFlow<span className="text-[#bfdbfe]">.</span>
                </Link>
                <div className="w-full max-w-[470px] m-auto py-[78px] px-0 max-[700px]:hidden">
                    <h2>
                        A little more focus.
                        <br />A lot more <span>possibility.</span>
                    </h2>
                </div>
            </aside>
            <section
                className="pt-15 pb-8 flex flex-col bg-[var(--page,#f8faff)] px-[12%] max-[1050px]:px-[10%] max-[700px]:pt-5 max-[700px]:pb-6 max-[700px]:px-7"
                aria-label="Your account"
            >
                <div className="w-full max-w-[390px] m-auto py-15 px-0 max-[700px]:pt-[35px] max-[700px]:pb-[45px] max-[700px]:px-0">
                    {children}
                </div>
            </section>
        </main>
    );
}
