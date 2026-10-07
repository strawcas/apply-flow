export const currencies = ["PHP", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "JPY"] as const;
export const workModes = ["Remote", "Hybrid", "On-site"] as const;
export const settingsMetadataKey = "applyflow_settings";

export type Settings = {
    calendarView: "month" | "agenda";
    weekStartsOn: 0 | 1;
    timeFormat: "12h" | "24h";
    currency: "" | (typeof currencies)[number];
    workMode: (typeof workModes)[number];
};

export const defaultSettings: Settings = {
    calendarView: "month",
    weekStartsOn: 0,
    timeFormat: "12h",
    currency: "",
    workMode: "Remote",
};

// Metadata is editable by the account holder; only use validated preferences.
export function readSettings(value: unknown): Settings {
    const values = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
    return {
        calendarView: values.calendarView === "agenda" ? "agenda" : "month",
        weekStartsOn: values.weekStartsOn === 1 ? 1 : 0,
        timeFormat: values.timeFormat === "24h" ? "24h" : "12h",
        currency: currencies.includes(values.currency as (typeof currencies)[number])
            ? (values.currency as Settings["currency"])
            : "",
        workMode: workModes.includes(values.workMode as (typeof workModes)[number])
            ? (values.workMode as Settings["workMode"])
            : "Remote",
    };
}

export function parseSettings(
    formData: FormData,
): { success: true; values: Settings } | { success: false; message: string } {
    const calendarView = formData.get("calendarView");
    const weekStartsOn = formData.get("weekStartsOn");
    const timeFormat = formData.get("timeFormat");
    const currency = formData.get("currency");
    const workMode = formData.get("workMode");
    if (
        (calendarView !== "month" && calendarView !== "agenda") ||
        (weekStartsOn !== "0" && weekStartsOn !== "1") ||
        (timeFormat !== "12h" && timeFormat !== "24h") ||
        (currency !== "" && !currencies.includes(currency as (typeof currencies)[number])) ||
        !workModes.includes(workMode as (typeof workModes)[number])
    )
        return { success: false, message: "Choose a valid option for each setting." };
    return {
        success: true,
        values: {
            calendarView,
            weekStartsOn: weekStartsOn === "1" ? 1 : 0,
            timeFormat,
            currency: currency as Settings["currency"],
            workMode: workMode as Settings["workMode"],
        },
    };
}
