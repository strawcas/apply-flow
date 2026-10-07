"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultSettings, type Settings } from "@/app/_lib/settings";

const SettingsContext = createContext<Settings>(defaultSettings);

export function SettingsProvider({ settings, children }: { settings: Settings; children: ReactNode }) {
    return <SettingsContext value={settings}>{children}</SettingsContext>;
}

export function useSettings() {
    return useContext(SettingsContext);
}
