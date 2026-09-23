"use client";

import { useState } from "react";
import Icon from "@/app/_components/dashboard/dashboard-icon";

import { addApplication } from "@/app/_actions/applicationActions";

export default function AddApplicationModal() {
    const [isOpen, setIsOpen] = useState(false);

    const inputStyles =
        "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

    return (
        <>
            {/* Add application button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex cursor-pointer items-center gap-3 rounded-lg border-0 bg-[#2f66f5] px-5 py-3 text-sm font-semibold text-white shadow-sm outline-none transition hover:bg-[#2859dc]"
            >
                <Icon name="plus" />
                Add application
            </button>

            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="add-application-title"
                        onClick={(event) => event.stopPropagation()}
                        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
                    >
                        {/* Header */}
                        <header className="flex shrink-0 items-start justify-between border-b border-zinc-200 px-6 py-5">
                            <div>
                                <p className="mb-1 text-xs font-semibold tracking-widest text-zinc-500">
                                    NEW OPPORTUNITY
                                </p>

                                <h2 id="add-application-title" className="text-xl font-semibold text-zinc-900">
                                    Add application
                                </h2>

                                <p className="mt-1 text-sm text-zinc-500">
                                    Add a job opportunity to your application tracker.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                aria-label="Close modal"
                                className="flex size-9 cursor-pointer appearance-none items-center justify-center rounded-lg border-0 bg-transparent text-xl text-zinc-500 outline-none transition hover:bg-zinc-100 hover:text-zinc-900"
                            >
                                ×
                            </button>
                        </header>

                        {/* Form */}
                        <form action={addApplication} className="flex min-h-0 flex-1 flex-col">
                            {/* Scrollable form fields */}
                            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                                {/* Company + Job title */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-zinc-700">Company</span>

                                        <input
                                            name="companyName"
                                            type="text"
                                            placeholder="e.g. Stripe"
                                            required
                                            className={inputStyles}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-zinc-700">Job title</span>

                                        <input
                                            name="jobTitle"
                                            type="text"
                                            placeholder="e.g. Frontend Developer"
                                            required
                                            className={inputStyles}
                                        />
                                    </label>
                                </div>

                                {/* Job URL */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-zinc-700">Job posting URL</span>

                                    <input name="jobUrl" type="url" placeholder="https://..." className={inputStyles} />
                                </label>

                                {/* Source + Location */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-zinc-700">Source</span>

                                        <input
                                            name="source"
                                            type="text"
                                            placeholder="e.g. LinkedIn"
                                            className={inputStyles}
                                        />
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-zinc-700">Location</span>

                                        <input
                                            name="location"
                                            type="text"
                                            placeholder="e.g. Manila, Philippines"
                                            required
                                            className={inputStyles}
                                        />
                                    </label>
                                </div>

                                {/* Work mode + Employment type */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-zinc-700">Work arrangement</span>

                                        <select name="workMode" defaultValue="Remote" required className={inputStyles}>
                                            <option value="Remote">Remote</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="On-site">On-site</option>
                                        </select>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-zinc-700">Employment type</span>

                                        <select
                                            name="employmentType"
                                            defaultValue="Full-time"
                                            required
                                            className={inputStyles}
                                        >
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Contractual">Contractual</option>
                                            <option value="Gig">Gig</option>
                                        </select>
                                    </label>
                                </div>

                                {/* Status + Date applied */}
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-zinc-700">Status</span>

                                        <select name="status" defaultValue="Applied" required className={inputStyles}>
                                            <option value="Applied">Applied</option>
                                            <option value="In review">In review</option>
                                            <option value="Interview">Interview</option>
                                            <option value="Offer">Offer</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </label>

                                    <label className="flex flex-col gap-2">
                                        <span className="text-sm font-medium text-zinc-700">Date applied</span>

                                        <input name="dateApplied" type="date" className={inputStyles} />
                                    </label>
                                </div>

                                {/* Salary */}
                                <div>
                                    <span className="text-sm font-medium text-zinc-700">Salary</span>

                                    <div className="mt-2 grid gap-5 sm:grid-cols-3">
                                        <label className="flex flex-col gap-2">
                                            <span className="text-xs text-zinc-500">Minimum</span>

                                            <input
                                                name="salaryMin"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="50000"
                                                className={inputStyles}
                                            />
                                        </label>

                                        <label className="flex flex-col gap-2">
                                            <span className="text-xs text-zinc-500">Maximum</span>

                                            <input
                                                name="salaryMax"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="80000"
                                                className={inputStyles}
                                            />
                                        </label>

                                        <label className="flex flex-col gap-2">
                                            <span className="text-xs text-zinc-500">Currency</span>

                                            <select name="currency" defaultValue="" className={inputStyles}>
                                                <option value="">Select</option>
                                                <option value="PHP">PHP</option>
                                                <option value="USD">USD</option>
                                                <option value="EUR">EUR</option>
                                                <option value="GBP">GBP</option>
                                                <option value="AUD">AUD</option>
                                                <option value="CAD">CAD</option>
                                                <option value="SGD">SGD</option>
                                                <option value="JPY">JPY</option>
                                            </select>
                                        </label>
                                    </div>
                                </div>

                                {/* Deadline */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-zinc-700">Application deadline</span>

                                    <input name="deadline" type="date" className={inputStyles} />
                                </label>

                                {/* Notes */}
                                <label className="flex flex-col gap-2">
                                    <span className="text-sm font-medium text-zinc-700">Notes</span>

                                    <textarea
                                        name="notes"
                                        rows={4}
                                        placeholder="Interview details, recruiter name, reminders, or anything else..."
                                        className={`${inputStyles} resize-none`}
                                    />
                                </label>
                            </div>

                            {/* Footer */}
                            <footer className="flex shrink-0 justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="cursor-pointer appearance-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 outline-none transition hover:bg-zinc-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="cursor-pointer appearance-none rounded-xl border-0 bg-[#2f66f5] px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-[#2859dc]"
                                >
                                    Add application
                                </button>
                            </footer>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
