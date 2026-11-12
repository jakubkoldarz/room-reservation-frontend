import type { Availability } from "@/features/availabilities/types";
import {
    eventOn,
    formatHm,
    slotsForDate,
    toMinutes,
} from "@/features/availabilities/utils/schedule";
import type { EventInfo } from "@/features/events/types";
import type { Reservation, ReservationRoom } from "@/features/reservations/types";
import {
    formatUserName,
    getReservationState,
} from "@/features/reservations/utils/reservationState";
import { toIsoDate } from "@/utils/isoDate";
import type {
    CalendarAllDay,
    CalendarBlock,
    CalendarBlockContent,
    CalendarDay,
    CalendarMore,
    LanePlacement,
    MinuteRange,
} from "../types";

const DEFAULT_HOURS = { start: 8, end: 18 };
export const MAX_GRID_LANES = 2;
const DAYS_IN_WEEK = 7;
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function startOfWeek(date: Date): Date {
    const dayOfWeek = date.getDay();
    let daysSinceMonday = dayOfWeek - 1;
    if (dayOfWeek === 0) daysSinceMonday = 6;

    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - daysSinceMonday);
}

export function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

export function parseIsoDate(value: unknown): Date | null {
    if (typeof value !== "string") return null;

    const match = ISO_DATE.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(year, month - 1, day);

    const isRealDate = date.getMonth() === month - 1 && date.getDate() === day;
    if (!isRealDate) return null;
    return date;
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat("en-GB", options).format(date);
}

export function formatWeekRange(weekStart: Date): string {
    const weekEnd = addDays(weekStart, 6);
    const sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
    const sameMonth = sameYear && weekStart.getMonth() === weekEnd.getMonth();
    const end = formatDate(weekEnd, { day: "numeric", month: "short", year: "numeric" });

    if (sameMonth) {
        return `${weekStart.getDate()} – ${end}`;
    }
    if (sameYear) {
        const start = formatDate(weekStart, { day: "numeric", month: "short" });
        return `${start} – ${end}`;
    }
    const start = formatDate(weekStart, { day: "numeric", month: "short", year: "numeric" });
    return `${start} – ${end}`;
}

export function minutesToHm(minutes: number): string {
    const hours = String(Math.floor(minutes / 60)).padStart(2, "0");
    const rest = String(minutes % 60).padStart(2, "0");
    return `${hours}:${rest}`;
}

function compareByStartThenLongest(a: MinuteRange, b: MinuteRange): number {
    if (a.start !== b.start) return a.start - b.start;
    return b.end - a.end;
}

function compareByStart(a: MinuteRange, b: MinuteRange): number {
    return a.start - b.start;
}

function splitIntoClusters<T extends MinuteRange>(sorted: readonly T[]): T[][] {
    const clusters: T[][] = [];
    let current: T[] = [];
    let latestEnd = -1;

    for (const item of sorted) {
        const startsAfterEverything = item.start >= latestEnd;
        if (startsAfterEverything && current.length > 0) {
            clusters.push(current);
            current = [];
        }
        current.push(item);
        if (item.end > latestEnd) latestEnd = item.end;
    }
    if (current.length > 0) clusters.push(current);

    return clusters;
}

export function layoutLanes<T extends MinuteRange>(items: readonly T[]): (T & LanePlacement)[] {
    const sorted = [...items].sort(compareByStartThenLongest);
    const clusters = splitIntoClusters(sorted);
    const result: (T & LanePlacement)[] = [];

    for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
        const laneEnds: number[] = [];
        const placed: (T & LanePlacement)[] = [];

        for (const item of clusters[clusterIndex]) {
            let lane = laneEnds.findIndex((end) => end <= item.start);
            if (lane === -1) lane = laneEnds.length;
            laneEnds[lane] = item.end;
            placed.push({ ...item, lane, lanes: 1, cluster: clusterIndex });
        }

        for (const item of placed) {
            item.lanes = laneEnds.length;
            result.push(item);
        }
    }

    return result;
}

export function hourRange(
    availabilities: readonly Availability[],
    days: readonly CalendarDay[],
): { start: number; end: number } {
    const minutes: number[] = [];

    for (const slot of availabilities) {
        minutes.push(toMinutes(slot.startTime));
        minutes.push(toMinutes(slot.endTime));
    }
    for (const day of days) {
        for (const interval of day.openIntervals) {
            minutes.push(interval.start);
            minutes.push(interval.end);
        }
    }

    const hasOpeningHours = minutes.length > 0;
    if (!hasOpeningHours) {
        minutes.push(DEFAULT_HOURS.start * 60);
        minutes.push(DEFAULT_HOURS.end * 60);
    }

    for (const day of days) {
        for (const block of day.blocks) {
            minutes.push(block.start);
            minutes.push(block.end);
        }
    }

    const earliest = Math.min(...minutes);
    const latest = Math.max(...minutes);
    const start = Math.max(0, Math.floor(earliest / 60));
    const end = Math.min(24, Math.ceil(latest / 60));

    if (end > start) return { start, end };
    return DEFAULT_HOURS;
}

function bookedBy(reservation: Reservation): string {
    return formatUserName(reservation.createdBy.by);
}

function isActive(block: CalendarBlockContent): boolean {
    return block.kind === "approved" || block.kind === "pending";
}

function overlaps(a: MinuteRange, b: MinuteRange): boolean {
    return a.start < b.end && b.start < a.end;
}

function reservationBlock(
    reservation: Reservation,
    requiresApproval: boolean,
    title: string,
    room: ReservationRoom | null,
): CalendarBlockContent {
    const startTime = formatHm(reservation.startTime);
    const endTime = formatHm(reservation.endTime);

    return {
        id: reservation.id,
        kind: getReservationState(reservation, requiresApproval),
        start: toMinutes(reservation.startTime),
        end: toMinutes(reservation.endTime),
        time: `${startTime}–${endTime}`,
        title,
        detail: reservation.purpose ?? "",
        reservation,
        room,
    };
}

function eventOverride(event: EventInfo): CalendarAllDay {
    let hours: string | null = null;
    if (!event.isClosed && event.startTime && event.endTime) {
        hours = `${formatHm(event.startTime)}–${formatHm(event.endTime)}`;
    }

    return { id: event.id, title: event.name, isClosed: hours === null, hours };
}

export function overrideLabel(item: CalendarAllDay): string {
    if (item.isClosed) return `Closed: ${item.title}`;
    return `${item.title} · special hours ${item.hours}`;
}

export function blockLines(
    block: Pick<CalendarBlock, "time" | "title" | "detail">,
    capacity: number,
): string[] {
    if (capacity <= 1) {
        const startTime = block.time.split("–")[0];
        let text = block.title;
        if (block.detail !== "") text = block.detail;
        return [`${startTime} ${text}`];
    }

    const lines: string[] = [];
    for (const text of [block.time, block.detail, block.title]) {
        if (text !== "" && lines.length < capacity) lines.push(text);
    }
    return lines;
}

function moreMarker(group: readonly CalendarBlock[], maxLanes: number): CalendarMore {
    const sorted = [...group].sort(compareByStart);
    const first = sorted[0];
    const tooltipLines = [`${sorted.length} more at this time:`];
    let end = first.end;

    for (const block of sorted) {
        tooltipLines.push(`${block.time} · ${block.title}`);
        if (block.end > end) end = block.end;
    }

    return {
        id: `more-${first.id}`,
        start: first.start,
        end,
        lane: maxLanes - 1,
        lanes: maxLanes,
        count: sorted.length,
        tooltip: tooltipLines.join("\n"),
    };
}

export function layoutGrid(
    blocks: readonly CalendarBlockContent[],
    maxLanes = MAX_GRID_LANES,
): CalendarDay["grid"] {
    const active = blocks.filter(isActive);

    const shown: CalendarBlockContent[] = [];
    for (const block of blocks) {
        const isCoveredByActive = active.some((other) => overlaps(other, block));
        if (isActive(block) || !isCoveredByActive) shown.push(block);
    }

    const visible: CalendarBlock[] = [];
    const hiddenByCluster = new Map<number, CalendarBlock[]>();

    for (const placed of layoutLanes(shown)) {
        const { cluster, ...block } = placed;

        if (block.lanes <= maxLanes) {
            visible.push(block);
        } else if (block.lane < maxLanes - 1) {
            visible.push({ ...block, lanes: maxLanes });
        } else {
            const group = hiddenByCluster.get(cluster) ?? [];
            group.push(block);
            hiddenByCluster.set(cluster, group);
        }
    }

    const more: CalendarMore[] = [];
    for (const group of hiddenByCluster.values()) {
        more.push(moreMarker(group, maxLanes));
    }

    return { blocks: visible, more };
}

export function buildCalendarDays(options: {
    weekStart: Date;
    now: Date;
    reservations: readonly Reservation[];
    events: readonly EventInfo[];
    availabilities: readonly Availability[];
    requiresApproval: boolean;
    reservationTitle?: (reservation: Reservation) => string;
    roomOf?: (reservation: Reservation) => ReservationRoom;
}): CalendarDay[] {
    const todayIso = toIsoDate(options.now);
    const titleOf = options.reservationTitle ?? bookedBy;
    const days: CalendarDay[] = [];

    for (let dayIndex = 0; dayIndex < DAYS_IN_WEEK; dayIndex++) {
        const date = addDays(options.weekStart, dayIndex);
        const iso = toIsoDate(date);

        const blocks: CalendarBlockContent[] = [];
        for (const reservation of options.reservations) {
            if (reservation.date !== iso) continue;

            let room: ReservationRoom | null = null;
            if (options.roomOf) room = options.roomOf(reservation);

            const title = titleOf(reservation);
            blocks.push(reservationBlock(reservation, options.requiresApproval, title, room));
        }

        const openIntervals: MinuteRange[] = [];
        for (const slot of slotsForDate(options.availabilities, date, options.events)) {
            openIntervals.push({
                start: toMinutes(slot.startTime),
                end: toMinutes(slot.endTime),
            });
        }

        const allDay: CalendarAllDay[] = [];
        const event = eventOn(options.events, iso);
        if (event) allDay.push(eventOverride(event));

        days.push({
            date,
            iso,
            isToday: iso === todayIso,
            openIntervals,
            allDay,
            blocks: layoutLanes(blocks),
            grid: layoutGrid(blocks),
        });
    }

    return days;
}
