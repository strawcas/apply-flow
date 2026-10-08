"use client";

import { useState, useTransition, type FormEvent } from "react";
import { saveSettings, type SettingsResult } from "@/app/_actions/settingsActions";
import { currencies, workModes, type Settings } from "@/app/_lib/settings";
import { useTheme } from "@/app/_components/theme-provider";
import { type ThemePreference } from "@/app/_lib/theme";
import Icon from "./dashboard-icon";
import styles from "./settings-overview.module.css";

const themes: { value: ThemePreference; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
];

export default function SettingsOverview({ settings }: { settings: Settings }) {
    const { preference, setTheme } = useTheme();
    const [saved, setSaved] = useState(settings);
    const [draft, setDraft] = useState(settings);
    const [result, setResult] = useState<SettingsResult | null>(null);
    const [pending, startTransition] = useTransition();
    const [exporting, setExporting] = useState<"applications" | "calendar" | null>(null);
    const [downloadMessage, setDownloadMessage] = useState("");
    const [downloadError, setDownloadError] = useState(false);
    const changed = Object.keys(saved).some((key) => saved[key as keyof Settings] !== draft[key as keyof Settings]);

    function edit<K extends keyof Settings>(key: K, value: Settings[K]) {
        setDraft((current) => ({ ...current, [key]: value }));
        setResult(null);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setResult(null);
        startTransition(async () => {
            try {
                const response = await saveSettings(data);
                setResult(response);
                if (response.success) {
                    setSaved(response.values);
                    setDraft(response.values);
                }
            } catch {
                setResult({
                    success: false,
                    message: "Settings could not be saved. Check your connection and try again.",
                });
            }
        });
    }

    async function download(format: "applications" | "calendar") {
        setExporting(format);
        setDownloadMessage("");
        setDownloadError(false);
        try {
            const response = await fetch(`/settings/export/${format}`, { cache: "no-store" });
            if (!response.ok) {
                const error = await response.json().catch(() => null);
                throw new Error(error?.message || "Your download could not be prepared. Please try again.");
            }
            if (
                !response.headers
                    .get("Content-Type")
                    ?.startsWith(format === "applications" ? "text/csv" : "text/calendar")
            ) {
                throw new Error("Sign in again to download your data.");
            }
            const url = URL.createObjectURL(await response.blob());
            const link = document.createElement("a");
            link.href = url;
            link.download = `applyflow-${format}.${format === "applications" ? "csv" : "ics"}`;
            document.body.append(link);
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 1000);
            setDownloadMessage(`${format === "applications" ? "Applications" : "Calendar"} downloaded.`);
        } catch (error) {
            setDownloadError(true);
            setDownloadMessage(error instanceof Error ? error.message : "Your download failed. Please try again.");
        } finally {
            setExporting(null);
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <h1>Settings</h1>
            </header>

            <section className={styles.card} aria-labelledby="appearance-title">
                <div className={styles.appearanceRow}>
                    <div>
                        <h2 id="appearance-title">Appearance</h2>
                        <p className={styles.help}>Applies to this browser.</p>
                    </div>
                    <fieldset className={styles.themes}>
                        <legend className={styles.srOnly}>Theme</legend>
                        {themes.map(({ value, label }) => (
                            <label
                                key={value}
                                className={`${styles.themeOption} ${preference === value ? styles.selectedTheme : ""}`}
                            >
                                <input
                                    type="radio"
                                    name="theme"
                                    value={value}
                                    checked={preference === value}
                                    onChange={() => setTheme(value)}
                                    className={styles.srOnly}
                                />
                                {label}
                            </label>
                        ))}
                    </fieldset>
                </div>
            </section>

            <form onSubmit={submit} aria-busy={pending} className={styles.preferences}>
                <fieldset disabled={pending} className={styles.card} aria-labelledby="calendar-settings-title">
                    <legend className={styles.srOnly}>Calendar preferences</legend>
                    <h2 id="calendar-settings-title">Calendar</h2>
                    <div className={styles.threeColumns}>
                        <div className={styles.field}>
                            <label htmlFor="settings-calendar-view">Default view</label>
                            <select
                                id="settings-calendar-view"
                                name="calendarView"
                                value={draft.calendarView}
                                onChange={(event) =>
                                    edit("calendarView", event.target.value as Settings["calendarView"])
                                }
                            >
                                <option value="month">Month</option>
                                <option value="agenda">Agenda</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="settings-week-start">Week starts on</label>
                            <select
                                id="settings-week-start"
                                name="weekStartsOn"
                                value={draft.weekStartsOn}
                                onChange={(event) => edit("weekStartsOn", Number(event.target.value) as 0 | 1)}
                            >
                                <option value="0">Sunday</option>
                                <option value="1">Monday</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="settings-time-format">Time format</label>
                            <select
                                id="settings-time-format"
                                name="timeFormat"
                                value={draft.timeFormat}
                                onChange={(event) => edit("timeFormat", event.target.value as Settings["timeFormat"])}
                            >
                                <option value="12h">12-hour (2:30 PM)</option>
                                <option value="24h">24-hour (14:30)</option>
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset disabled={pending} className={styles.card} aria-labelledby="application-settings-title">
                    <legend className={styles.srOnly}>Application defaults</legend>
                    <h2 id="application-settings-title">Application defaults</h2>
                    <p className={styles.help}>Used for new applications.</p>
                    <div className={styles.twoColumns}>
                        <div className={styles.field}>
                            <label htmlFor="settings-currency">Currency</label>
                            <select
                                id="settings-currency"
                                name="currency"
                                value={draft.currency}
                                onChange={(event) => edit("currency", event.target.value as Settings["currency"])}
                            >
                                <option value="">No default</option>
                                {currencies.map((currency) => (
                                    <option key={currency} value={currency}>
                                        {currency}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="settings-work-mode">Work arrangement</label>
                            <select
                                id="settings-work-mode"
                                name="workMode"
                                value={draft.workMode}
                                onChange={(event) => edit("workMode", event.target.value as Settings["workMode"])}
                            >
                                {workModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <div className={styles.formFooter}>
                    <div className={styles.status} aria-live="polite" aria-atomic="true">
                        {result ? (
                            <p
                                role={result.success ? "status" : "alert"}
                                className={result.success ? styles.success : styles.error}
                            >
                                {result.message}
                            </p>
                        ) : (
                            <span>
                                {pending
                                    ? "Saving…"
                                    : changed
                                      ? "Unsaved changes"
                                      : "Preferences saved to your account."}
                            </span>
                        )}
                    </div>
                    <div className={styles.actions}>
                        <button
                            type="button"
                            className={styles.secondaryButton}
                            disabled={!changed || pending}
                            onClick={() => {
                                setDraft(saved);
                                setResult(null);
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className={styles.primaryButton} disabled={!changed || pending}>
                            <Icon name="check" />
                            {pending ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </div>
            </form>

            <section className={styles.card} aria-labelledby="data-export-title">
                <h2 id="data-export-title">Data export</h2>
                <div className={styles.exportRow}>
                    <div>
                        <h3>Applications</h3>
                        <p className={styles.help}>All applications, including notes and salary.</p>
                    </div>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={exporting !== null}
                        onClick={() => void download("applications")}
                    >
                        <DownloadIcon />
                        {exporting === "applications" ? "Preparing…" : "Download CSV"}
                    </button>
                </div>
                <div className={styles.exportRow}>
                    <div>
                        <h3>Calendar</h3>
                        <p className={styles.help}>Events, application deadlines, and interviews. Times stay local.</p>
                    </div>
                    <button
                        type="button"
                        className={styles.secondaryButton}
                        disabled={exporting !== null}
                        onClick={() => void download("calendar")}
                    >
                        <DownloadIcon />
                        {exporting === "calendar" ? "Preparing…" : "Download .ics"}
                    </button>
                </div>
                <div className={styles.downloadStatus} aria-live="polite" aria-atomic="true">
                    {downloadMessage && (
                        <p
                            role={downloadError ? "alert" : "status"}
                            className={downloadError ? styles.error : styles.success}
                        >
                            {downloadMessage}
                        </p>
                    )}
                </div>
            </section>
        </div>
    );
}

function DownloadIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5" />
        </svg>
    );
}
