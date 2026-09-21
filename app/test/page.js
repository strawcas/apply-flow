"use client";

import { sendEmail } from "../_actions/emails";

export default function page() {
    const html = `
    <div>
        <h1>Welcome to ApplyFlow!</h1>

        <p>
            Thanks for creating an account. You can now start tracking
            your job applications in one place.
        </p>

        <p>
            Add companies, update application statuses, and keep notes
            for interviews and follow-ups.
        </p>

        <a href="https://example.com/dashboard">
            Open your dashboard
        </a>

        <p>
            Good luck with your job search!
        </p>
    </div>
    `;

    return (
        <div>
            <button
                onClick={() => {
                    sendEmail("josephgabrielcastro20work@gmail.com", "Random Testing", html);
                }}
            >
                send Random Email
            </button>
        </div>
    );
}
