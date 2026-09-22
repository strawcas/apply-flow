export type RegistrationStatus = { email: string; email_confirmed_at: Date | null } | null;

export function oauthDestination(intent: "login" | "signup", profile: RegistrationStatus, email: string) {
    if (intent === "login" && !profile) return "/login?notice=signup-first";
    return registrationDestination(profile, email);
}

export function readOAuthFlow(value: string | undefined, nonce: string | null): "login" | "signup" | null {
    if (!value || !nonce) return null;
    try {
        const flow = JSON.parse(value);
        if (flow && flow.nonce === nonce && (flow.intent === "login" || flow.intent === "signup")) return flow.intent;
    } catch { /* Invalid cookies must fail closed. */ }
    return null;
}

export function registrationDestination(profile: RegistrationStatus, email: string) {
    if (!profile) return "/signup/complete";
    if (profile.email !== email || !profile.email_confirmed_at) return "/confirm-email";
    return "/dashboard";
}

export function validateProfile(fullName: unknown, birthDate: unknown, today = new Date().toISOString().slice(0, 10)) {
    if (typeof fullName !== "string" || !fullName.trim() || fullName.trim().length > 100) {
        return "Enter your full name (up to 100 characters).";
    }
    if (typeof birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
        return "Enter a valid birthdate.";
    }
    const date = new Date(`${birthDate}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== birthDate || birthDate < "1900-01-01" || birthDate > today) {
        return "Enter a real birthdate between January 1, 1900 and today.";
    }
    return null;
}
