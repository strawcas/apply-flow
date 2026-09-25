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
                    <p className="text-[#bfceed] text-[10px] font-semibold tracking-[2px] mt-0 mb-6 mx-0">
                        YOUR NEXT CHAPTER STARTS HERE
                    </p>
                    <h2>
                        A little more focus.
                        <br />A lot more <span>possibility.</span>
                    </h2>
                    <p className="text-[#c6d5ed] text-[17px] leading-[1.9] max-w-[355px] mt-6 mb-0 mx-0">
                        Keep your applications in order and your next opportunity in sight. One place to move your
                        career forward.
                    </p>
                    <div
                        className="mt-12 bg-[#ffffff08] [border:1px_solid_#ffffff20] rounded-[15px] [transform:rotate(-2deg)] p-6 max-[1050px]:p-[18px]"
                        aria-hidden="true"
                    >
                        <div className="flex justify-between text-[#bed0ed] text-[9px] tracking-[1.8px]">
                            <span>YOUR NEXT MOVE</span>
                            <span>•••</span>
                        </div>
                        <div className="flex items-center gap-3 mt-6 [&_strong]:block [&_strong]:text-[13px] [&_strong]:font-medium [&_div_>_span]:block [&_div_>_span]:mt-[5px] [&_div_>_span]:text-[10px] [&_div_>_span]:text-[#bdcfee]">
                            <span className="grid place-items-center bg-[var(--blue-soft,#dbeafe)] text-[var(--blue-text,#1e40af)] w-10 h-10 rounded-[10px] text-[27px]">
                                ✳
                            </span>
                            <div>
                                <strong>Product Designer</strong>
                                <span>Your next opportunity</span>
                            </div>
                            <span className="ml-auto rounded-[20px] bg-[#bfdbfe19] text-[#bfdbfe] text-[9px] whitespace-nowrap py-[7px] px-[9px] max-[1050px]:hidden">
                                In progress
                            </span>
                        </div>
                        <div className="flex gap-[6px] mt-[26px] [&_i]:h-1 [&_i]:flex-1 [&_i]:rounded-[4px] [&_i]:bg-[#ffffff18] [&_i:first-child]:bg-[#bfdbfe] [&_i:nth-child(2)]:bg-[#60a5fa]">
                            <i />
                            <i />
                            <i />
                        </div>
                        <div className="flex justify-between mt-[9px] text-[#c6d5ed] text-[9px]">
                            <span>Applied</span>
                            <span>Interview</span>
                            <span>Offer</span>
                        </div>
                        <div className="mt-[23px] -mr-2 mb-[-38px] ml-5 [border:1px_solid_#5279b4] rounded-[9px] bg-[#28518e] text-[11px] [transform:rotate(4deg)] shadow-[0_8px_20px_#10264d20] p-[15px] [&_span]:text-[#bfdbfe] [&_span]:mr-2">
                            <span>✓</span> Every step is a step forward.
                        </div>
                    </div>
                </div>
                <p className="text-[11px] text-[#b9ccec] m-0 max-[700px]:hidden">Less juggling. More moving forward.</p>
            </aside>
            <section
                className="pt-15 pb-8 flex flex-col bg-[var(--page,#f8faff)] px-[12%] max-[1050px]:px-[10%] max-[700px]:pt-5 max-[700px]:pb-6 max-[700px]:px-7"
                aria-label="Your account"
            >
                <div className="w-full max-w-[390px] m-auto py-15 px-0 max-[700px]:pt-[35px] max-[700px]:pb-[45px] max-[700px]:px-0">
                    {children}
                </div>
                <p className="text-[13px]! text-center text-[var(--muted)] leading-[1.7] m-0">
                    Your next opportunity is out there. Let’s get you there.
                </p>
            </section>
        </main>
    );
}
