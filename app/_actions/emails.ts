// actions/emails.ts

"use server";

import { transporter } from "@/app/_lib/nodemailer";

export async function sendEmail(to: string, subject: string, html: string) {
    await transporter.sendMail({
        from: `"ApplyFlow" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html,
    });
}
