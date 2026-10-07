"use client";

export default function CalendarError({ retry }: { retry: () => void }) {
    return (
        <section className="rounded-xl border border-solid border-[var(--line)] bg-[var(--surface,#fff)] p-8 text-[14px]">
            <h1 className="m-0 text-[28px] font-semibold tracking-[-0.7px]">Calendar</h1>
            <p className="my-4 text-[var(--text-secondary,#52637d)]">
                Your calendar could not be loaded. Please try again.
            </p>
            <button
                type="button"
                onClick={retry}
                className="rounded-lg border-0 bg-[#2f66f5] px-5 py-3 font-semibold text-white hover:bg-[#2859dc]"
            >
                Try again
            </button>
        </section>
    );
}
