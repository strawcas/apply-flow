import "server-only";
import { discardConfirmation, reserveConfirmation } from "@/app/_db/profiles";
import { transporter } from "./nodemailer";
import { siteUrl } from "./site-url";

export async function sendRegistrationConfirmation(userId: string, email: string) {
    const origin = siteUrl();
    if (!process.env.GMAIL_ADDRESS || !process.env.GMAIL_APP_PASSWORD) {
        throw new Error("Configure GMAIL_ADDRESS and GMAIL_APP_PASSWORD to send confirmation emails.");
    }
    const confirmation = await reserveConfirmation(userId, email);
    if (!confirmation) return "Please wait 60 seconds before requesting another confirmation email.";
    const url = new URL("/auth/confirm", origin);
    url.searchParams.set("token", confirmation.token);
    try {
        await transporter.sendMail({
            from: { name: "ApplyFlow", address: process.env.GMAIL_ADDRESS },
            to: email,
            subject: "Confirm your ApplyFlow email address",
            text: `Hi there,\n\nConfirm your email to finish creating your ApplyFlow account:\n${url.href}\n\nThis link expires in 24 hours. If you didn't request this, ignore this email.`,
            html: `<h1>ApplyFlow</h1><h2>Confirm your email address</h2><p>Hi there,</p><p>Confirm your email to finish creating your ApplyFlow account.</p><p><a href="${url.href}">Confirm email address</a></p><p>This link expires in 24 hours. If you didn't request this, ignore this email.</p>`,
        });
    } catch (error) {
        await discardConfirmation(userId, confirmation.hash);
        throw error;
    }
    return "Confirmation email sent. Check your inbox and spam folder.";
}
