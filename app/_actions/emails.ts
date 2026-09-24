// actions/emails.ts

"use server";

import { transporter } from "@/app/_lib/nodemailer";
import { session } from "@/app/_lib/session";

export async function sendEmail(to: string, subject: string, html: string) {
    // Keep the old test action from being an unauthenticated mail relay.
    const profile = await session();
    if (to !== profile.email) throw new Error("You can only send a test email to your own account.");
    await transporter.sendMail({
        from: { name: "ApplyFlow", address: process.env.GMAIL_ADDRESS! },
        to,
        subject,
        html,
    });
}
