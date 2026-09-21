import { NextResponse } from "next/server";
import { transporter } from "./nodemailer";

export async function POST() {
    try {
        await transporter.sendMail({
            from: `"ApplyFlow" <${process.env.GMAIL_USER}>`,
            to: "recipient@gmail.com",
            subject: "Hello from ApplyFlow",
            text: "Nodemailer is working!",
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                success: false,
                error: "Failed to send email",
            },
            {
                status: 500,
            },
        );
    }
}
