"use client";

import { useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import Modal, { useModal } from "@/app/_components/Modal";
import { removeCalendarEvent, saveCalendarEvent } from "@/app/_actions/calendarActions";
import { calendarKinds, type CalendarItem } from "@/app/_lib/calendar";
import Icon from "./dashboard-icon";
import styles from "./calendar-overview.module.css";

type Props = {
    event: CalendarItem | null;
    date: string;
    onSaved: (date: string, message: string) => void;
};

export default function CalendarEventForm({ event, date, onSaved }: Props) {
    const { close } = useModal();
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);

    async function save(formData: FormData) {
        setError("");
        try {
            const result = await saveCalendarEvent(event?.id ?? null, formData);
            if (!result.success) {
                setError(result.message);
                return;
            }
            onSaved(String(formData.get("date")), result.message);
            close();
        } catch {
            setError("Your event could not be saved. Check your connection and try again.");
        }
    }

    async function remove() {
        if (!event) return;
        setError("");
        try {
            const result = await removeCalendarEvent(event.id);
            if (!result.success) {
                setError(result.message);
                return;
            }
            onSaved(event.date, result.message);
            close();
        } catch {
            setError("Your event could not be deleted. Check your connection and try again.");
        }
    }

    return (
        <>
            <header className={styles.dialogHeader}>
                <div>
                    <h2 className={styles.dialogTitle}>{event ? "Edit event" : "Add event"}</h2>
                </div>
                <Modal.Close>
                    <button type="button" className={styles.iconButton} aria-label="Close event form">
                        <Icon name="close" />
                    </button>
                </Modal.Close>
            </header>
            <form action={save} className={styles.eventForm}>
                <EventFields event={event} date={date} />
                {error && (
                    <p role="alert" className={styles.formError}>
                        {error}
                    </p>
                )}
                <EventButtons
                    editing={!!event}
                    confirmDelete={confirmDelete}
                    onConfirmDelete={() => setConfirmDelete(true)}
                    onCancelDelete={() => setConfirmDelete(false)}
                    remove={remove}
                />
            </form>
        </>
    );
}

function EventFields({ event, date }: Pick<Props, "event" | "date">) {
    const { pending } = useFormStatus();
    // Controlled fields retain edits when a save fails and React resets the form.
    const [values, setValues] = useState({
        title: event?.title ?? "",
        kind: event?.kind ?? "Interview",
        company: event?.company ?? "",
        date: event?.date ?? date,
        time: event?.time ?? "",
        endTime: event?.endTime ?? "",
        location: event?.location ?? "",
        notes: event?.notes ?? "",
    });
    function field(name: keyof typeof values) {
        return {
            value: values[name],
            onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
                setValues((previous) => ({ ...previous, [name]: event.target.value })),
        };
    }
    return (
        <div className={styles.formBody}>
            <fieldset disabled={pending} className={styles.formFields}>
                <label className={styles.field}>
                    <span>
                        Event title <span className={styles.required}>*</span>
                    </span>
                    <input
                        name="title"
                        required
                        maxLength={120}
                        {...field("title")}
                        placeholder="e.g. First-round interview"
                        data-autofocus
                    />
                </label>
                <div className={styles.fieldRow}>
                    <label className={styles.field}>
                        <span>
                            Event type <span className={styles.required}>*</span>
                        </span>
                        <select name="kind" {...field("kind")}>
                            {calendarKinds.map((kind) => (
                                <option key={kind}>{kind}</option>
                            ))}
                        </select>
                    </label>
                    <label className={styles.field}>
                        <span>
                            Company <span className={styles.optional}>optional</span>
                        </span>
                        <input name="company" maxLength={120} {...field("company")} placeholder="Company name" />
                    </label>
                </div>
                <label className={styles.field}>
                    <span>
                        Date <span className={styles.required}>*</span>
                    </span>
                    <input name="date" type="date" required min="1900-01-01" max="9999-12-31" {...field("date")} />
                </label>
                <div className={styles.fieldRow}>
                    <label className={styles.field}>
                        <span>
                            Start time <span className={styles.optional}>optional</span>
                        </span>
                        <input name="time" type="time" {...field("time")} aria-describedby="event-time-help" />
                    </label>
                    <label className={styles.field}>
                        <span>
                            End time <span className={styles.optional}>optional</span>
                        </span>
                        <input
                            name="endTime"
                            type="time"
                            min={values.time || undefined}
                            {...field("endTime")}
                            aria-describedby="event-time-help"
                        />
                    </label>
                </div>
                <p id="event-time-help" className={styles.fieldHelp}>
                    Use your local time. Leave both times blank for an all-day event.
                </p>
                <label className={styles.field}>
                    <span>
                        Location or meeting link <span className={styles.optional}>optional</span>
                    </span>
                    <input
                        name="location"
                        maxLength={500}
                        {...field("location")}
                        placeholder="Office address or video call link"
                    />
                </label>
                <label className={styles.field}>
                    <span>
                        Notes <span className={styles.optional}>optional</span>
                    </span>
                    <textarea
                        name="notes"
                        rows={3}
                        maxLength={2000}
                        {...field("notes")}
                        placeholder="People to meet, things to prepare, or a reminder for yourself…"
                    />
                </label>
            </fieldset>
        </div>
    );
}

function EventButtons({
    editing,
    confirmDelete,
    onConfirmDelete,
    onCancelDelete,
    remove,
}: {
    editing: boolean;
    confirmDelete: boolean;
    onConfirmDelete: () => void;
    onCancelDelete: () => void;
    remove: () => Promise<void>;
}) {
    const { pending } = useFormStatus();
    return (
        <footer className={styles.formFooter}>
            {confirmDelete ? (
                <>
                    <span className={styles.deletePrompt}>Delete this event?</span>
                    <button
                        type="button"
                        disabled={pending}
                        className={styles.secondaryButton}
                        onClick={onCancelDelete}
                    >
                        Keep event
                    </button>
                    <button
                        type="submit"
                        formAction={remove}
                        formNoValidate
                        disabled={pending}
                        className={styles.dangerButton}
                    >
                        {pending ? "Deleting…" : "Delete event"}
                    </button>
                </>
            ) : (
                <>
                    {editing && (
                        <button
                            type="button"
                            disabled={pending}
                            className={styles.deleteButton}
                            onClick={onConfirmDelete}
                        >
                            Delete event
                        </button>
                    )}
                    <Modal.Close>
                        <button type="button" disabled={pending} className={styles.secondaryButton}>
                            Cancel
                        </button>
                    </Modal.Close>
                    <button type="submit" disabled={pending} className={styles.primaryButton}>
                        {pending ? "Saving…" : editing ? "Save changes" : "Add event"}
                    </button>
                </>
            )}
        </footer>
    );
}
