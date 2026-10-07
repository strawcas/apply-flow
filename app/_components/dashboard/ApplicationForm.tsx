"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import Modal, { useModal } from "@/app/_components/Modal";
import { addApplication } from "@/app/_actions/applicationActions";
import type { applications } from "@/drizzle/schema";
import { currencies, workModes } from "@/app/_lib/settings";
import { useSettings } from "./settings-provider";
import { applicationStatuses } from "@/app/_lib/application-status";

type ApplicationFormValues = Omit<typeof applications.$inferSelect, "id" | "createdAt" | "userId">;

type FormAction = (formData: FormData) => void | Promise<void>;
type DeleteAction = () => Promise<{ success: boolean; message: string }>;

type ApplicationFormProps =
    | {
          type: "add";
          initialValue?: never;
          submitAction?: FormAction;
          deleteAction?: never;
      }
    | {
          type: "edit";
          initialValue: ApplicationFormValues;
          submitAction: FormAction;
          deleteAction: DeleteAction;
      };

export default function ApplicationForm({ type, initialValue, submitAction, deleteAction }: ApplicationFormProps) {
    const isEdit = type === "edit";
    const settings = useSettings();
    const [status, setStatus] = useState(initialValue?.status ?? "Applied");
    const [dateApplied, setDateApplied] = useState(initialValue?.dateApplied ?? "");

    const action = type === "add" ? (submitAction ?? addApplication) : submitAction;

    const { close } = useModal();

    async function handleAction(formData: FormData) {
        await action(formData);
        close();
    }

    const inputStyles =
        "w-full rounded-xl border border-[var(--border-strong,var(--color-zinc-300))] bg-[var(--surface,#fff)] px-3.5 py-2.5 text-sm text-[var(--text-primary,var(--color-zinc-900))] [&:is(input,select)]:[font:inherit] outline-none transition placeholder:text-[var(--text-muted,var(--color-zinc-400))] focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10";

    return (
        <>
            <header className="flex shrink-0 items-start justify-between border-b border-[var(--border,var(--color-zinc-200))] px-6 py-5">
                <div>
                    <h2 className="m-0 text-xl font-semibold text-[var(--text-primary,var(--color-zinc-900))]">
                        {isEdit ? "Edit application" : "Add application"}
                    </h2>
                </div>

                <Modal.Close>
                    <button
                        type="button"
                        aria-label="Close modal"
                        className="[font:inherit] flex size-9 cursor-pointer appearance-none items-center justify-center rounded-lg border-0 bg-transparent text-xl text-[var(--text-muted,var(--color-zinc-500))] outline-none transition hover:bg-[var(--surface-hover,var(--color-zinc-100))] hover:text-[var(--text-primary,var(--color-zinc-900))]"
                    >
                        ×
                    </button>
                </Modal.Close>
            </header>

            <form action={handleAction} className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                                Company
                            </span>

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
                            <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                                Job title
                            </span>

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
                        <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                            Job posting URL
                        </span>

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
                            <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                                Source
                            </span>

                            <input
                                name="source"
                                type="text"
                                placeholder="e.g. LinkedIn"
                                defaultValue={initialValue?.source ?? ""}
                                className={inputStyles}
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                                Location
                            </span>

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
                            <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                                Work arrangement
                            </span>

                            <select
                                name="workMode"
                                defaultValue={isEdit ? initialValue.workMode : settings.workMode}
                                required
                                className={inputStyles}
                            >
                                {workModes.map((mode) => (
                                    <option key={mode} value={mode}>
                                        {mode}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                                Employment type
                            </span>

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
                            <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                                Status
                            </span>

                            <select
                                name="status"
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                required
                                className={inputStyles}
                            >
                                {applicationStatuses.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                                Date applied
                            </span>

                            <input
                                name="dateApplied"
                                type="date"
                                value={status === "Saved" ? "" : dateApplied}
                                onChange={(event) => setDateApplied(event.target.value)}
                                disabled={status === "Saved"}
                                className={inputStyles}
                            />
                        </label>
                    </div>

                    <div>
                        <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                            Salary
                        </span>

                        <div className="mt-2 grid gap-5 sm:grid-cols-3">
                            <label className="flex flex-col gap-2">
                                <span className="text-xs text-[var(--text-muted,var(--color-zinc-500))]">Minimum</span>

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
                                <span className="text-xs text-[var(--text-muted,var(--color-zinc-500))]">Maximum</span>

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
                                <span className="text-xs text-[var(--text-muted,var(--color-zinc-500))]">Currency</span>

                                <select
                                    name="currency"
                                    defaultValue={isEdit ? (initialValue.currency ?? "") : settings.currency}
                                    className={inputStyles}
                                >
                                    <option value="">Select</option>
                                    {currencies.map((currency) => (
                                        <option key={currency} value={currency}>
                                            {currency}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                    </div>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                            Application deadline
                        </span>

                        <input
                            name="deadline"
                            type="date"
                            defaultValue={initialValue?.deadline ?? ""}
                            className={inputStyles}
                        />
                    </label>

                    <label className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))]">
                            Notes
                        </span>

                        <textarea
                            name="notes"
                            rows={4}
                            placeholder="Interview details, recruiter name, reminders, or anything else..."
                            defaultValue={initialValue?.notes ?? ""}
                            className={`${inputStyles} resize-none`}
                        />
                    </label>
                </div>

                <ApplicationFormButtons isEdit={isEdit} deleteAction={deleteAction} />
            </form>
        </>
    );
}

function ApplicationFormButtons({ isEdit, deleteAction }: { isEdit: boolean; deleteAction?: DeleteAction }) {
    const { close } = useModal();
    const { pending: saving } = useFormStatus();
    const [deleting, startDelete] = useTransition();
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [error, setError] = useState("");
    const pending = saving || deleting;

    function remove() {
        if (!deleteAction || pending) return;
        setError("");
        startDelete(async () => {
            try {
                const result = await deleteAction();
                if (!result.success) {
                    setError(result.message);
                    return;
                }
                close();
            } catch {
                setError("Your application could not be deleted. Check your connection and try again.");
            }
        });
    }

    const secondaryStyles =
        "[font:inherit] cursor-pointer appearance-none rounded-xl border border-[var(--border-strong,var(--color-zinc-300))] bg-[var(--surface,#fff)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary,var(--color-zinc-700))] outline-none transition hover:bg-[var(--surface-hover,var(--color-zinc-50))]";
    const deleteStyles =
        "[font:inherit] cursor-pointer appearance-none rounded-xl border border-[var(--red-soft,var(--color-red-200))] bg-[var(--surface,#fff)] px-4 py-2.5 text-sm font-medium text-[var(--red-text,var(--color-red-600))] outline-none transition hover:bg-[var(--red-soft,var(--color-red-50))] focus-visible:ring-2 focus-visible:ring-red-500/30";

    return (
        <footer className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-[var(--border,var(--color-zinc-200))] bg-[var(--surface,#fff)] px-6 py-4">
            {error && (
                <p role="alert" className="m-0 w-full text-sm text-[var(--red-text,var(--color-red-600))]">
                    {error}
                </p>
            )}
            {confirmDelete ? (
                <>
                    <p className="m-0 mr-auto text-sm text-[var(--text-secondary,var(--color-zinc-700))]">
                        Delete this application? This cannot be undone.
                    </p>
                    <button
                        type="button"
                        disabled={pending}
                        className={secondaryStyles}
                        onClick={() => {
                            setConfirmDelete(false);
                            setError("");
                        }}
                    >
                        Keep application
                    </button>
                    <button type="button" disabled={pending} className={deleteStyles} onClick={remove}>
                        {deleting ? "Deleting…" : "Delete application"}
                    </button>
                </>
            ) : (
                <>
                    {isEdit && (
                        <button
                            type="button"
                            disabled={pending}
                            className={`${deleteStyles} mr-auto max-sm:w-full`}
                            onClick={() => setConfirmDelete(true)}
                        >
                            Delete
                        </button>
                    )}
                    <Modal.Close>
                        <button type="button" disabled={pending} className={secondaryStyles}>
                            Cancel
                        </button>
                    </Modal.Close>
                    <button
                        type="submit"
                        disabled={pending}
                        className="[font:inherit] cursor-pointer appearance-none rounded-xl border-0 bg-[#2f66f5] px-5 py-2.5 text-sm font-semibold text-white outline-none transition hover:bg-[#2859dc]"
                    >
                        {saving ? "Saving…" : isEdit ? "Save changes" : "Add application"}
                    </button>
                </>
            )}
        </footer>
    );
}
