"use client";

import { useTheme } from "./theme-provider";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
    const { theme, setTheme } = useTheme();

    return (
        <button
            type="button"
            role="switch"
            aria-checked={theme === "dark"}
            aria-label="Dark mode"
            title="Dark mode"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`theme-toggle ${compact ? "theme-toggle--compact" : "theme-toggle--full"}`}
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
            >
                <path d="M20.9 13.1A9 9 0 0 1 10.9 3.1 9 9 0 1 0 20.9 13.1Z" />
            </svg>
            <span className={compact ? "sr-only" : "theme-toggle__label"}>Dark mode</span>
            <span className="theme-toggle__track" aria-hidden="true">
                <span className="theme-toggle__thumb" />
            </span>
        </button>
    );
}
