"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { themeStorageKey, type Theme } from "@/app/_lib/theme";

function readPreference(fallback: Theme | null = null): Theme | null {
    try {
        const saved = localStorage.getItem(themeStorageKey);
        return saved === "light" || saved === "dark" ? saved : null;
    } catch {
        return fallback;
    }
}

function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
}

const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void } | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setCurrentTheme] = useState<Theme>("light");
    const preference = useRef<Theme | null>(null);

    useEffect(() => {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
        preference.current = readPreference(preference.current);

        const syncTheme = () => {
            const next = preference.current ?? (systemTheme.matches ? "dark" : "light");
            applyTheme(next);
            setCurrentTheme(next);
        };
        const syncStorage = (event: StorageEvent) => {
            if (event.key === themeStorageKey || event.key === null) {
                preference.current = readPreference(preference.current);
                syncTheme();
            }
        };

        // Browser preferences can only be read after hydration. The head script
        // applies the colors before paint; this synchronizes the accessible controls.
        syncTheme();
        systemTheme.addEventListener("change", syncTheme);
        window.addEventListener("storage", syncStorage);
        return () => {
            systemTheme.removeEventListener("change", syncTheme);
            window.removeEventListener("storage", syncStorage);
        };
    }, []);

    function setTheme(next: Theme) {
        preference.current = next;
        try {
            localStorage.setItem(themeStorageKey, next);
        } catch {
            // The switch still works when browser storage is unavailable.
        }
        applyTheme(next);
        setCurrentTheme(next);
    }

    return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
}
