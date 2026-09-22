import "dotenv/config";
import nodemailer from "nodemailer";

try {
    const response = await fetch(new URL("/auth/v1/settings", process.env.NEXT_PUBLIC_SUPABASE_URL), {
        headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY },
        signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const settings = await response.json();
    console.log({ google_enabled: settings.external?.google, email_enabled: settings.external?.email, signup_disabled: settings.disable_signup });
    if (process.argv.includes("--email")) {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: { user: process.env.GMAIL_ADDRESS, pass: process.env.GMAIL_APP_PASSWORD },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,
        });
        try {
            await transport.verify();
            console.log("Confirmation SMTP credentials verified. No email was sent.");
        } catch {
            console.error("Confirmation SMTP verification failed. Check the Gmail sender and app password.");
            process.exitCode = 1;
        } finally {
            transport.close();
        }
    }
} catch {
    console.error("Couldn't read the public Supabase provider settings. Check the project URL, key, and network.");
    process.exitCode = 1;
}
