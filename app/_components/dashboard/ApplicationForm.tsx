"use client";

import Modal from "@/app/_components/Modal";
import { addApplication } from "@/app/_actions/applicationActions";

type ApplicationStatus = "Applied" | "In review" | "Interview" | "Offer" | "Rejected";

type WorkMode = "Remote" | "Hybrid" | "On-site";

type EmploymentType = "Full-time" | "Part-time" | "Contractual" | "Gig";

type Currency = "PHP" | "USD" | "EUR" | "GBP" | "AUD" | "CAD" | "SGD" | "JPY";

type ApplicationFormValues = {
    companyName: string;
    jobTitle: string;

    status: ApplicationStatus;
    location: string;
    workMode: WorkMode;
    employmentType: EmploymentType;

    jobUrl?: string | null;
    source?: string | null;

    salaryMin?: string | null;
    salaryMax?: string | null;
    currency?: Currency | null;

    dateApplied?: string | null;
    deadline?: string | null;

    notes?: string | null;
};

type FormAction = (formData: FormData) => void | Promise<void>;

type ApplicationFormProps =
    | {
          type: "add";
          initialValue?: never;
          submitAction?: FormAction;
      }
    | {
          type: "edit";
          initialValue: ApplicationFormValues;
          submitAction: FormAction;
      };

export default function ApplicationForm({ type, initialValue, submitAction }: ApplicationFormProps) {
    const isEdit = type === "edit";

    const action = type === "add" ? (submitAction ?? addApplication) : submitAction;

    const inputStyles =
        "w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 [&:is(input,select)]:[font:inherit] outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

    return (
        <>
            <header className="flex shrink-0 items-start justify-between border-b border-zinc-200 px-6 py-5">
                <div>
                    <p className="mb-1 text-xs font-semibold tracking-widest text-zinc-500">
                        {isEdit ? "EDIT OPPORTUNITY" : "NEW OPPORTUNITY"}
                    </p>

                    <h2 className="text-xl font-semibold text-zinc-900">
                        {isEdit ? "Edit application" : "Add application"}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500">
                        {isEdit ? "Update this job application." : "Add a job opportunity to your application tracker."}
                    </p>
                </div>

                <Modal.Close>
                    <button
                        type="button"
                        aria-label="Close modal"
                        className="[font:inherit] flex size-9 cursor-pointer appearance-none items-center justify-center rounded-lg border-0 bg-transparent text-xl text-zinc-500 outline-none transition hover:bg-zinc-100 hover:text-zinc-900"
                    >
                        ×
                    </button>
                </Modal.Close>
            </header>

            <form action={action} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-zinc-700">Company</span>

                            <input
                                name="companyName"
                                type="text"
                                placeholder="e.g. Stripe"
                                defaultValue={initialValue?.companyName ?? ""}
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
                                defaultValue={initialValue?.jobTitle ?? ""}
                                required
                                className={inputStyles}
                            />
                        </label>
                    </div>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-zinc-700">Job posting URL</span>

                        <input
                            name="jobUrl"
                            type="url"
                            placeholder="https://..."
                            defaultValue={initialValue?.jobUrl ?? ""}
                            className={inputStyles}
                        />
                    </label>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-zinc-700">Source</span>

                            <input
                                name="source"
                                type="text"
                                placeholder="e.g. LinkedIn"
                                defaultValue={initialValue?.source ?? ""}
                                className={inputStyles}
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-zinc-700">Location</span>

                            <input
                                name="location"
                                type="text"
                                placeholder="e.g. Manila, Philippines"
                                defaultValue={initialValue?.location ?? ""}
                                required
                                className={inputStyles}
                            />
                        </label>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-zinc-700">Work arrangement</span>

                            <select
                                name="workMode"
                                defaultValue={initialValue?.workMode ?? "Remote"}
                                required
                                className={inputStyles}
                            >
                                <option value="Remote">Remote</option>
                                <option value="Hybrid">Hybrid</option>
                                <option value="On-site">On-site</option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-zinc-700">Employment type</span>

                            <select
                                name="employmentType"
                                defaultValue={initialValue?.employmentType ?? "Full-time"}
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

                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-zinc-700">Status</span>

                            <select
                                name="status"
                                defaultValue={initialValue?.status ?? "Applied"}
                                required
                                className={inputStyles}
                            >
                                <option value="Applied">Applied</option>
                                <option value="In review">In review</option>
                                <option value="Interview">Interview</option>
                                <option value="Offer">Offer</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-zinc-700">Date applied</span>

                            <input
                                name="dateApplied"
                                type="date"
                                defaultValue={initialValue?.dateApplied ?? ""}
                                className={inputStyles}
                            />
                        </label>
                    </div>

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
                                    defaultValue={initialValue?.salaryMin ?? ""}
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
                                    defaultValue={initialValue?.salaryMax ?? ""}
                                    className={inputStyles}
                                />
                            </label>

                            <label className="flex flex-col gap-2">
                                <span className="text-xs text-zinc-500">Currency</span>

                                <select
                                    name="currency"
                                    defaultValue={initialValue?.currency ?? ""}
                                    className={inputStyles}
                                >
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

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-zinc-700">Application deadline</span>

                        <input
                            name="deadline"
                            type="date"
                            defaultValue={initialValue?.deadline ?? ""}
                            className={inputStyles}
                        />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-zinc-700">Notes</span>

                        <textarea
                            name="notes"
                            rows={4}
                            placeholder="Interview details, recruiter name, reminders, or anything else..."
                            defaultValue={initialValue?.notes ?? ""}
                            className={`${inputStyles} resize-none`}
                        />
                    </label>
                </div>

                <footer className="flex shrink-0 justify-end gap-3 border-t border-zinc-200 bg-white px-6 py-4">
                    <Modal.Close>
                        <button
                            type="button"
                            className="[font:inherit] cursor-pointer appearance-none rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 outline-none transition hover:bg-zinc-50"
                        >
                            Cancel
                        </button>
                    </Modal.Close>

                    <button
                        type="submit"
                        className="[font:inherit] cursor-pointer appearance-none rounded-xl border-0 bg-[#2f66f5] px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-[#2859dc]"
                    >
                        {isEdit ? "Save changes" : "Add application"}
                    </button>
                </footer>
            </form>
        </>
    );
}
