"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { themeStorageKey, type Theme, type ThemePreference } from "@/app/_lib/theme";

function readPreference(fallback: ThemePreference = "system"): ThemePreference {
    try {
        const saved = localStorage.getItem(themeStorageKey);
        return saved === "light" || saved === "dark" ? saved : "system";
    } catch {
        return fallback;
    }
}

function applyTheme(theme: Theme) {
    document.documentElement.classList.toggle("dark", theme === "dark");
}

const ThemeContext = createContext<{
    theme: Theme;
    preference: ThemePreference;
    setTheme: (theme: ThemePreference) => void;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setCurrentTheme] = useState<Theme>("light");
    const preference = useRef<ThemePreference>("system");
    const [currentPreference, setCurrentPreference] = useState<ThemePreference>("system");

    useEffect(() => {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
        preference.current = readPreference(preference.current);

        const syncTheme = () => {
            const next =
                preference.current === "system" ? (systemTheme.matches ? "dark" : "light") : preference.current;
            applyTheme(next);
            setCurrentTheme(next);
            setCurrentPreference(preference.current);
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

    function setTheme(next: ThemePreference) {
        preference.current = next;
        try {
            localStorage.setItem(themeStorageKey, next);
        } catch {
            // The switch still works when browser storage is unavailable.
        }
        const resolved =
            next === "system" ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : next;
        applyTheme(resolved);
        setCurrentTheme(resolved);
        setCurrentPreference(next);
    }

    return <ThemeContext value={{ theme, preference: currentPreference, setTheme }}>{children}</ThemeContext>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme must be used within ThemeProvider");
    return context;
}
