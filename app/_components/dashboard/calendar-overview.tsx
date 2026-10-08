"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import Link from "next/link";
import Modal, { useModal } from "@/app/_components/Modal";
import {
    calendarDays,
    calendarKinds,
    formatCalendarDate,
    formatCalendarTimeRange,
    isCalendarDate,
    localToday,
    shiftDate,
    shiftMonth,
    sortCalendarItems,
    type CalendarItem,
    type CalendarKind,
} from "@/app/_lib/calendar";
import CalendarEventForm from "./calendar-event-form";
import Icon from "./dashboard-icon";
import styles from "./calendar-overview.module.css";
import { useSettings } from "./settings-provider";

const kindStyles: Record<CalendarKind, string> = {
    Interview: styles.interview,
    Deadline: styles.deadline,
    "Follow-up": styles.followUp,
    Reminder: styles.reminder,
};
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
function subscribeToDateChange(callback: () => void) {
    const timer = window.setInterval(callback, 60_000);
    return () => window.clearInterval(timer);
}

export default function CalendarOverview(props: { items: CalendarItem[]; initialToday: string }) {
    return (
        <Modal>
            <CalendarContent {...props} />
        </Modal>
    );
}

function CalendarContent({ items, initialToday }: { items: CalendarItem[]; initialToday: string }) {
    const { open } = useModal();
    const settings = useSettings();
    const today = useSyncExternalStore(subscribeToDateChange, localToday, () => initialToday);
    const [selected, setSelected] = useState<string | null>(null);
    const [month, setMonth] = useState<string | null>(null);
    const [view, setView] = useState<"month" | "agenda">(settings.calendarView);
    const [kind, setKind] = useState("");
    const [query, setQuery] = useState("");
    const [editingEvent, setEditingEvent] = useState<CalendarItem | null>(null);
    const [applicationEvent, setApplicationEvent] = useState<CalendarItem | null>(null);
    const [message, setMessage] = useState("");
    const gridRef = useRef<HTMLTableElement>(null);
    const focusDate = useRef<string | null>(null);
    const selectedDate = selected ?? today;
    const visibleMonth = month ?? today.slice(0, 7);
    const days = calendarDays(visibleMonth, settings.weekStartsOn);
    const orderedWeekdays = [...weekdays.slice(settings.weekStartsOn), ...weekdays.slice(0, settings.weekStartsOn)];
    const sorted = sortCalendarItems(items);
    const search = query.trim().toLowerCase();
    const filtered = sorted.filter(
        (item) =>
            (!kind || item.kind === kind) &&
            `${item.title} ${item.company ?? ""} ${item.location ?? ""}`.toLowerCase().includes(search),
    );
    const eventsByDay = new Map<string, CalendarItem[]>();
    for (const item of filtered) eventsByDay.set(item.date, [...(eventsByDay.get(item.date) ?? []), item]);
    const monthItems = filtered.filter((item) => item.date.startsWith(visibleMonth));
    const monthDays = [...new Set(monthItems.map((item) => item.date))];
    const dayItems = eventsByDay.get(selectedDate) ?? [];
    const upcoming = filtered.filter((item) => item.date >= today).slice(0, 4);
    const allMonthItems = sorted.filter((item) => item.date.startsWith(visibleMonth));
    const weekEnd = shiftDate(today, 6);
    const metrics = [
        {
            label: "Interviews this month",
            count: allMonthItems.filter((item) => item.kind === "Interview").length,
            icon: "calendar" as const,
            color: styles.interview,
        },
        {
            label: "Deadlines this month",
            count: allMonthItems.filter((item) => item.kind === "Deadline").length,
            icon: "goal" as const,
            color: styles.deadline,
        },
        {
            label: "Events in the next 7 days",
            count: sorted.filter((item) => item.date >= today && item.date <= weekEnd).length,
            icon: "activity" as const,
            color: styles.followUp,
        },
    ];

    useEffect(() => {
        if (!focusDate.current) return;
        gridRef.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate.current}"]`)?.focus();
        focusDate.current = null;
    }, [selectedDate, visibleMonth]);

    function selectDate(date: string) {
        setSelected(date);
        if (!date.startsWith(visibleMonth)) setMonth(date.slice(0, 7));
    }

    function moveMonth(amount: number) {
        const nextMonth = shiftMonth(visibleMonth, amount);
        setMonth(nextMonth);
        setSelected(`${nextMonth}-01`);
    }

    function goToToday() {
        setSelected(today);
        setMonth(today.slice(0, 7));
    }

    function addEvent(date = selectedDate) {
        setSelected(date);
        setEditingEvent(null);
        open("calendar-event");
    }

    function openEvent(item: CalendarItem) {
        selectDate(item.date);
        if (item.source === "application") {
            setApplicationEvent(item);
            open("calendar-application");
        } else {
            setEditingEvent(item);
            open("calendar-event");
        }
    }

    function saved(date: string, successMessage: string) {
        selectDate(date);
        setMessage(successMessage);
    }

    function navigateDay(event: KeyboardEvent<HTMLButtonElement>, date: string) {
        let next: string;
        const weekday = (new Date(`${date}T00:00:00Z`).getUTCDay() - settings.weekStartsOn + 7) % 7;
        switch (event.key) {
            case "ArrowLeft":
                next = shiftDate(date, -1);
                break;
            case "ArrowRight":
                next = shiftDate(date, 1);
                break;
            case "ArrowUp":
                next = shiftDate(date, -7);
                break;
            case "ArrowDown":
                next = shiftDate(date, 7);
                break;
            case "Home":
                next = shiftDate(date, -weekday);
                break;
            case "End":
                next = shiftDate(date, 6 - weekday);
                break;
            default:
                return;
        }
        event.preventDefault();
        if (!isCalendarDate(next)) return;
        focusDate.current = next;
        selectDate(next);
    }

    return (
        <div className={styles.page}>
            <header className={styles.pageHeader}>
                <h1>Calendar</h1>
                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => addEvent()}
                    aria-haspopup="dialog"
                >
                    <Icon name="plus" /> Add event
                </button>
            </header>

            <div className={styles.metrics}>
                {metrics.map((metric) => (
                    <article key={metric.label} className={styles.metric}>
                        <span className={`${styles.metricIcon} ${metric.color}`}>
                            <Icon name={metric.icon} />
                        </span>
                        <div>
                            <p className={styles.metricLabel}>{metric.label}</p>
                            <p className={styles.metricCount}>{metric.count}</p>
                        </div>
                    </article>
                ))}
            </div>

            {message && (
                <div className={styles.success} role="status">
                    <Icon name="check" />
                    <span>{message}</span>
                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={() => setMessage("")}
                        aria-label="Dismiss notification"
                    >
                        <Icon name="close" />
                    </button>
                </div>
            )}

            <div className={styles.workspace}>
                <section className={styles.calendar} aria-labelledby="calendar-month-title">
                    <header className={styles.calendarHeader}>
                        <div className={styles.monthControls}>
                            <h2 id="calendar-month-title" aria-live="polite">
                                {formatCalendarDate(`${visibleMonth}-01`, { month: "long", year: "numeric" })}
                            </h2>
                            <div className={styles.arrows}>
                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    aria-label="Previous month"
                                    onClick={() => moveMonth(-1)}
                                    disabled={visibleMonth <= "1900-01"}
                                >
                                    <Icon name="chevron-left" />
                                </button>
                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    aria-label="Next month"
                                    onClick={() => moveMonth(1)}
                                    disabled={visibleMonth >= "9999-12"}
                                >
                                    <Icon name="chevron-right" />
                                </button>
                            </div>
                            <button type="button" className={styles.todayButton} onClick={goToToday}>
                                Today
                            </button>
                        </div>
                        <div className={styles.viewSwitch} aria-label="Calendar view" role="group">
                            <button type="button" aria-pressed={view === "month"} onClick={() => setView("month")}>
                                Month
                            </button>
                            <button type="button" aria-pressed={view === "agenda"} onClick={() => setView("agenda")}>
                                Agenda
                            </button>
                        </div>
                    </header>
                    <div className={styles.toolbar}>
                        <label className={styles.search}>
                            <Icon name="search" />
                            <input
                                type="search"
                                aria-label="Search calendar events"
                                placeholder="Search your events…"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </label>
                        <select
                            aria-label="Filter events by type"
                            value={kind}
                            onChange={(event) => setKind(event.target.value)}
                            className={styles.typeFilter}
                        >
                            <option value="">All events</option>
                            {calendarKinds.map((value) => (
                                <option key={value}>{value}</option>
                            ))}
                        </select>
                    </div>

                    {view === "month" ? (
                        <table className={styles.monthTable} ref={gridRef}>
                            <caption className={styles.srOnly}>
                                Calendar for{" "}
                                {formatCalendarDate(`${visibleMonth}-01`, { month: "long", year: "numeric" })}. Select a
                                day to see its events. Use arrow keys to move between days.
                            </caption>
                            <thead>
                                <tr>
                                    {orderedWeekdays.map((day) => (
                                        <th key={day} scope="col" aria-label={day}>
                                            <span className={styles.desktopWeekday}>{day.slice(0, 3)}</span>
                                            <span className={styles.mobileWeekday} aria-hidden="true">
                                                {day.charAt(0)}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Array.from({ length: 6 }, (_, row) => (
                                    <tr key={row}>
                                        {days.slice(row * 7, row * 7 + 7).map((date) => {
                                            const events = eventsByDay.get(date) ?? [];
                                            const outside = !date.startsWith(visibleMonth);
                                            const isSelected = date === selectedDate;
                                            return (
                                                <td
                                                    key={date}
                                                    className={`${outside ? styles.outsideMonth : ""} ${isSelected ? styles.selectedCell : ""}`}
                                                >
                                                    <button
                                                        type="button"
                                                        data-date={date}
                                                        className={styles.day}
                                                        tabIndex={isSelected ? 0 : -1}
                                                        aria-pressed={isSelected}
                                                        disabled={!isCalendarDate(date)}
                                                        aria-current={date === today ? "date" : undefined}
                                                        aria-label={`${formatCalendarDate(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}, ${events.length} ${events.length === 1 ? "event" : "events"}`}
                                                        onClick={() => selectDate(date)}
                                                        onKeyDown={(event) => navigateDay(event, date)}
                                                    >
                                                        <span
                                                            className={`${styles.dayNumber} ${date === today ? styles.todayNumber : ""}`}
                                                        >
                                                            {Number(date.slice(-2))}
                                                        </span>
                                                        <span className={styles.dayEvents} aria-hidden="true">
                                                            {events.slice(0, 2).map((item) => (
                                                                <span
                                                                    key={item.id}
                                                                    className={`${styles.eventPill} ${kindStyles[item.kind]}`}
                                                                    title={`${item.title}${item.company ? ` · ${item.company}` : ""}`}
                                                                >
                                                                    <span className={styles.dot} />
                                                                    <span className={styles.pillText}>
                                                                        {item.company || item.title}
                                                                    </span>
                                                                </span>
                                                            ))}
                                                            {events.length > 2 && (
                                                                <span className={styles.moreEvents}>
                                                                    +{events.length - 2} more
                                                                </span>
                                                            )}
                                                        </span>
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className={styles.agenda}>
                            {monthDays.length ? (
                                monthDays.map((date) => (
                                    <section key={date} className={styles.agendaDay}>
                                        <button
                                            type="button"
                                            className={`${styles.agendaDate} ${date === today ? styles.agendaToday : ""}`}
                                            onClick={() => selectDate(date)}
                                            aria-label={`Select ${formatCalendarDate(date, { month: "long", day: "numeric" })}`}
                                        >
                                            <span>{formatCalendarDate(date, { weekday: "short" })}</span>
                                            <strong>{Number(date.slice(-2))}</strong>
                                        </button>
                                        <div className={styles.agendaEvents}>
                                            {eventsByDay.get(date)?.map((item) => (
                                                <EventCard key={item.id} item={item} onClick={() => openEvent(item)} />
                                            ))}
                                        </div>
                                    </section>
                                ))
                            ) : (
                                <EmptyState title={query || kind ? "No matching events" : "No events this month"}>
                                    {query || kind ? (
                                        <button
                                            type="button"
                                            className={styles.textButton}
                                            onClick={() => {
                                                setQuery("");
                                                setKind("");
                                            }}
                                        >
                                            Clear filters
                                        </button>
                                    ) : (
                                        <button type="button" className={styles.textButton} onClick={() => addEvent()}>
                                            <Icon name="plus" /> Add event
                                        </button>
                                    )}
                                </EmptyState>
                            )}
                        </div>
                    )}

                    <footer className={styles.calendarFooter}>
                        <div className={styles.legend}>
                            {calendarKinds.map((value) => (
                                <span key={value}>
                                    <i className={`${styles.dot} ${kindStyles[value]}`} />
                                    {value}
                                </span>
                            ))}
                        </div>
                        <span>
                            {monthItems.length} {monthItems.length === 1 ? "event" : "events"} this month
                        </span>
                    </footer>
                </section>

                <aside className={styles.agendaSidebar} aria-label="Your schedule">
                    <section className={styles.sidePanel} aria-labelledby="selected-day-title">
                        <header className={styles.panelHeader}>
                            <div>
                                <h2 id="selected-day-title">
                                    {formatCalendarDate(selectedDate, { month: "long", day: "numeric" })}
                                </h2>
                                <p className={styles.secondary}>
                                    {formatCalendarDate(selectedDate, { weekday: "long" })} · {selectedDate.slice(0, 4)}
                                </p>
                            </div>
                            <button
                                type="button"
                                className={styles.smallAdd}
                                aria-label={`Add event on ${formatCalendarDate(selectedDate, { month: "long", day: "numeric" })}`}
                                onClick={() => addEvent()}
                            >
                                <Icon name="plus" />
                            </button>
                        </header>
                        <div className={styles.panelContent}>
                            {dayItems.length ? (
                                dayItems.map((item) => (
                                    <EventCard key={item.id} item={item} onClick={() => openEvent(item)} />
                                ))
                            ) : (
                                <EmptyState compact title={query || kind ? "No matching events" : "No events"}>
                                    {query || kind ? (
                                        <button
                                            type="button"
                                            className={styles.textButton}
                                            onClick={() => {
                                                setQuery("");
                                                setKind("");
                                            }}
                                        >
                                            Clear filters
                                        </button>
                                    ) : (
                                        <button type="button" className={styles.textButton} onClick={() => addEvent()}>
                                            <Icon name="plus" /> Add event
                                        </button>
                                    )}
                                </EmptyState>
                            )}
                        </div>
                    </section>

                    <section className={styles.sidePanel} aria-labelledby="upcoming-events-title">
                        <header className={styles.upcomingHeader}>
                            <h2 id="upcoming-events-title">Upcoming events</h2>
                        </header>
                        <div className={styles.panelContent}>
                            {upcoming.length ? (
                                upcoming.map((item) => (
                                    <button
                                        key={item.id}
                                        type="button"
                                        className={styles.upcomingEvent}
                                        onClick={() => openEvent(item)}
                                    >
                                        <span className={`${styles.upcomingDate} ${kindStyles[item.kind]}`}>
                                            <span>{formatCalendarDate(item.date, { month: "short" })}</span>
                                            <strong>{Number(item.date.slice(-2))}</strong>
                                        </span>
                                        <span className={styles.upcomingDetails}>
                                            <strong>{item.title}</strong>
                                            <span>{item.company || item.kind}</span>
                                            <span>
                                                {formatCalendarTimeRange(item.time, item.endTime, settings.timeFormat)}
                                            </span>
                                        </span>
                                    </button>
                                ))
                            ) : (
                                <p className={styles.upcomingEmpty}>
                                    {query || kind ? "No matching upcoming events." : "No upcoming events."}
                                </p>
                            )}
                        </div>
                    </section>
                    <p className={styles.scheduleNote}>
                        <Icon name="applications" />
                        <span>Application deadlines and scheduled interviews appear here automatically.</span>
                    </p>
                </aside>
            </div>

            <Modal.Window
                name="calendar-event"
                aria-label={editingEvent ? "Edit calendar event" : "Add calendar event"}
            >
                <CalendarEventForm event={editingEvent} date={selectedDate} onSaved={saved} />
            </Modal.Window>
            <Modal.Window
                name="calendar-application"
                aria-label={`Application ${applicationEvent?.kind.toLowerCase() ?? "event"}`}
            >
                {applicationEvent && (
                    <>
                        <header className={styles.dialogHeader}>
                            <div>
                                <p className={styles.eyebrow}>APPLICATION {applicationEvent.kind.toUpperCase()}</p>
                                <h2 className={styles.dialogTitle}>{applicationEvent.company}</h2>
                                <p className={styles.secondary}>{applicationEvent.title}</p>
                            </div>
                            <Modal.Close>
                                <button type="button" className={styles.iconButton} aria-label="Close application event details">
                                    <Icon name="close" />
                                </button>
                            </Modal.Close>
                        </header>
                        <div className={styles.deadlineDetails}>
                            <p>
                                <Icon name="calendar" />
                                {formatCalendarDate(applicationEvent.date, {
                                    weekday: "long",
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </p>
                            {applicationEvent.time && (
                                <p className={styles.secondary}>
                                    {formatCalendarTimeRange(
                                        applicationEvent.time,
                                        applicationEvent.endTime,
                                        settings.timeFormat,
                                    )}
                                </p>
                            )}
                            {applicationEvent.location && <p className={styles.secondary}>{applicationEvent.location}</p>}
                            <p className={styles.deadlineNote}>{applicationEvent.notes}</p>
                        </div>
                        <footer className={styles.formFooter}>
                            <Modal.Close>
                                <button type="button" className={styles.secondaryButton}>
                                    Close
                                </button>
                            </Modal.Close>
                            <Link href="/applications" className={styles.primaryButton}>
                                View applications <Icon name="arrow" />
                            </Link>
                        </footer>
                    </>
                )}
            </Modal.Window>
        </div>
    );
}

function EventCard({ item, onClick }: { item: CalendarItem; onClick: () => void }) {
    const { timeFormat } = useSettings();
    return (
        <button
            type="button"
            className={styles.eventCard}
            onClick={onClick}
            aria-label={`${item.source === "event" ? "Edit event" : `View ${item.kind.toLowerCase()}`}: ${item.title}${item.company ? ` at ${item.company}` : ""}`}
        >
            <span className={styles.eventCardTop}>
                <span className={`${styles.kindBadge} ${kindStyles[item.kind]}`}>
                    <i className={styles.dot} />
                    {item.kind}
                </span>
                <span className={styles.eventTime}>{formatCalendarTimeRange(item.time, item.endTime, timeFormat)}</span>
            </span>
            <strong>{item.title}</strong>
            {item.company && <span className={styles.eventCompany}>{item.company}</span>}
            {item.location && <span className={styles.eventLocation}>{item.location}</span>}
            {item.source === "application" && (
                <span className={styles.sourceLabel}>
                    From your applications <Icon name="arrow" />
                </span>
            )}
        </button>
    );
}

function EmptyState({ title, compact = false, children }: { title: string; compact?: boolean; children?: ReactNode }) {
    return (
        <div className={`${styles.emptyState} ${compact ? styles.compactEmpty : ""}`}>
            <span className={styles.emptyIcon}>
                <Icon name="calendar" />
            </span>
            <h3>{title}</h3>
            {children}
        </div>
    );
}
