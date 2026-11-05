import type { Availability } from "@/features/availabilities/types";
import {
    eventOn,
    formatHm,
    slotsForDate,
    toMinutes,
} from "@/features/availabilities/utils/schedule";
import type { EventInfo } from "@/features/events/types";
import type { Reservation, ReservationState } from "@/features/reservations/types";
import {
    formatUserName,
    getReservationState,
    reservationStateLabel,
} from "@/features/reservations/utils/reservationState";
import { toIsoDate } from "@/utils/isoDate";
import type {
    CalendarAllDay,
    CalendarBlock,
    CalendarBlockKind,
    CalendarDay,
    CalendarMore,
    CalendarTitle,
} from "../types";

const DEFAULT_HOURS = { start: 8, end: 18 };
export const MAX_GRID_LANES = 2;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function startOfWeek(date: Date): Date {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return monday;
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function parseIsoDate(value: unknown): Date | null {
    const match = typeof value === "string" ? ISO_DATE.exec(value) : null;
    if (!match) return null;
    const [, year, month, day] = match.map(Number);
    const date = new Date(year, month - 1, day);
    return date.getMonth() === month - 1 && date.getDate() === day ? date : null;
}

export function formatWeekRange(weekStart: Date): string {
    const weekEnd = addDays(weekStart, 6);
    const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
    const sameMonth = sameYear && weekStart.getMonth() === weekEnd.getMonth();
    const format = (date: Date, options: Intl.DateTimeFormatOptions) =>
        new Intl.DateTimeFormat("en-GB", options).format(date);

    const end = format(weekEnd, { day: "numeric", month: "short", year: "numeric" });
    if (sameMonth) return `${weekStart.getDate()} – ${end}`;
    if (sameYear) return `${format(weekStart, { day: "numeric", month: "short" })} – ${end}`;
    return `${format(weekStart, { day: "numeric", month: "short", year: "numeric" })} – ${end}`;
}

export function minutesToHm(minutes: number): string {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    return `${hours}:${String(minutes % 60).padStart(2, "0")}`;
}

export function layoutLanes<T extends { start: number; end: number }>(
    items: readonly T[],
): (T & { lane: number; lanes: number; cluster: number })[] {
    const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
    const result: (T & { lane: number; lanes: number; cluster: number })[] = [];
    let cluster: (T & { lane: number; lanes: number; cluster: number })[] = [];
    let laneEnds: number[] = [];
    let clusterEnd = -1;
    let clusterIndex = 0;

    const closeCluster = () => {
        for (const item of cluster) item.lanes = laneEnds.length;
        result.push(...cluster);
        if (cluster.length > 0) clusterIndex++;
        cluster = [];
        laneEnds = [];
    };

    for (const item of sorted) {
        if (item.start >= clusterEnd) closeCluster();
        let lane = laneEnds.findIndex((end) => end <= item.start);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = item.end;
        clusterEnd = Math.max(clusterEnd, item.end);
        cluster.push({ ...item, lane, lanes: 1, cluster: clusterIndex });
    }
    closeCluster();
    return result;
}

export function hourRange(
    availabilities: readonly Availability[],
    days: readonly CalendarDay[],
): { start: number; end: number } {
    const scheduleMinutes = [
        ...availabilities.flatMap((slot) => [toMinutes(slot.startTime), toMinutes(slot.endTime)]),
        ...days.flatMap((day) =>
            day.openIntervals.flatMap((interval) => [interval.start, interval.end]),
        ),
    ];
    const baseMinutes =
        scheduleMinutes.length > 0
            ? scheduleMinutes
            : [DEFAULT_HOURS.start * 60, DEFAULT_HOURS.end * 60];
    const minutes = [
        ...baseMinutes,
        ...days.flatMap((day) => day.blocks.flatMap((block) => [block.start, block.end])),
    ];

    const start = Math.max(0, Math.floor(Math.min(...minutes) / 60));
    const end = Math.min(24, Math.ceil(Math.max(...minutes) / 60));
    return end > start ? { start, end } : DEFAULT_HOURS;
}

const BOOKED_BY_TITLE: CalendarTitle = {
    label: "Booked by",
    of: (reservation) => formatUserName(reservation.createdBy.by),
};

const ACTIVE_KINDS: ReadonlySet<CalendarBlockKind> = new Set(["approved", "pending"]);

const ACTOR_VERBS = { approved: "Approved", rejected: "Rejected", canceled: "Canceled" } as const;

function actorLine(reservation: Reservation, state: ReservationState): string | null {
    if (state === "pending") return null;
    const actor = {
        approved: reservation.approvedBy,
        rejected: reservation.rejectedBy,
        canceled: reservation.canceledBy,
    }[state];
    return actor ? `${ACTOR_VERBS[state]} by ${formatUserName(actor.by)}` : null;
}

function reservationTooltip(
    reservation: Reservation,
    state: ReservationState,
    time: string,
    title: { label: string; value: string },
): string {
    const reasonLabel = state === "rejected" ? "Rejection reason" : "Reason";
    return [
        `${reservationStateLabel(state)} · ${time}`,
        `${title.label}: ${title.value}`,
        reservation.purpose ? `Purpose: ${reservation.purpose}` : null,
        actorLine(reservation, state),
        reservation.reason ? `${reasonLabel}: ${reservation.reason}` : null,
    ]
        .filter(Boolean)
        .join("\n");
}

function reservationBlock(
    reservation: Reservation,
    requiresApproval: boolean,
    calendarTitle: CalendarTitle,
) {
    const state = getReservationState(reservation, requiresApproval);
    const time = `${formatHm(reservation.startTime)}–${formatHm(reservation.endTime)}`;
    const title = calendarTitle.of(reservation);
    const detail = reservation.purpose ?? "";
    const tooltip = reservationTooltip(reservation, state, time, {
        label: calendarTitle.label,
        value: title,
    });
    return {
        id: reservation.id,
        kind: state,
        start: toMinutes(reservation.startTime),
        end: toMinutes(reservation.endTime),
        time,
        title,
        detail,
        tooltip,
    };
}

function eventOverride(event: EventInfo): CalendarAllDay {
    const hours =
        !event.isClosed && event.startTime && event.endTime
            ? `${formatHm(event.startTime)}–${formatHm(event.endTime)}`
            : null;
    return { id: event.id, title: event.name, isClosed: event.isClosed || hours === null, hours };
}

export function overrideLabel(item: CalendarAllDay): string {
    return item.isClosed ? `Closed: ${item.title}` : `${item.title} · special hours ${item.hours}`;
}

export function layoutGrid(
    blocks: readonly Omit<CalendarBlock, "lane" | "lanes">[],
    maxLanes = MAX_GRID_LANES,
): CalendarDay["grid"] {
    const active = blocks.filter((block) => ACTIVE_KINDS.has(block.kind));
    const overlapsActive = (block: { start: number; end: number }) =>
        active.some((other) => other.start < block.end && block.start < other.end);
    const shown = blocks.filter((block) => ACTIVE_KINDS.has(block.kind) || !overlapsActive(block));

    const visible: CalendarBlock[] = [];
    const hidden = new Map<number, CalendarBlock[]>();
    for (const { cluster, ...block } of layoutLanes(shown)) {
        if (block.lanes <= maxLanes) visible.push(block);
        else if (block.lane < maxLanes - 1) visible.push({ ...block, lanes: maxLanes });
        else hidden.set(cluster, [...(hidden.get(cluster) ?? []), block]);
    }

    const more: CalendarMore[] = [...hidden.values()].map((group) => {
        const sorted = [...group].sort((a, b) => a.start - b.start);
        return {
            id: `more-${sorted[0].id}`,
            start: Math.min(...sorted.map((block) => block.start)),
            end: Math.max(...sorted.map((block) => block.end)),
            lane: maxLanes - 1,
            lanes: maxLanes,
            count: sorted.length,
            tooltip: [
                `${sorted.length} more at this time:`,
                ...sorted.map((block) => `${block.time} · ${block.title}`),
            ].join("\n"),
        };
    });

    return { blocks: visible, more };
}

export function buildCalendarDays(options: {
    weekStart: Date;
    now: Date;
    reservations: readonly Reservation[];
    events: readonly EventInfo[];
    availabilities: readonly Availability[];
    requiresApproval: boolean;
    reservationTitle?: CalendarTitle;
}): CalendarDay[] {
    const todayIso = toIsoDate(options.now);
    const calendarTitle = options.reservationTitle ?? BOOKED_BY_TITLE;

    return Array.from({ length: 7 }, (_, index) => {
        const date = addDays(options.weekStart, index);
        const iso = toIsoDate(date);
        const event = eventOn(options.events, iso);

        const blocks: Omit<CalendarBlock, "lane" | "lanes">[] = options.reservations
            .filter((reservation) => reservation.date === iso)
            .map((reservation) =>
                reservationBlock(reservation, options.requiresApproval, calendarTitle),
            );

        return {
            date,
            iso,
            isToday: iso === todayIso,
            openIntervals: slotsForDate(options.availabilities, date, options.events).map(
                (slot) => ({ start: toMinutes(slot.startTime), end: toMinutes(slot.endTime) }),
            ),
            allDay: event ? [eventOverride(event)] : [],
            blocks: layoutLanes(blocks),
            grid: layoutGrid(blocks),
        };
    });
}
