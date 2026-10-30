import type { Availability } from "@/features/availabilities/types";
import { formatHm, slotsForDay, toMinutes } from "@/features/availabilities/utils/schedule";
import type { EventInfo } from "@/features/events/types";
import type { Reservation } from "@/features/reservations/types";
import {
    formatUserName,
    getReservationState,
    reservationStateLabel,
} from "@/features/reservations/utils/reservationState";
import type { CalendarAllDay, CalendarBlock, CalendarDay } from "../types";

const DEFAULT_HOURS = { start: 8, end: 18 };
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

export function toIsoDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
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
): (T & { lane: number; lanes: number })[] {
    const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
    const result: (T & { lane: number; lanes: number })[] = [];
    let cluster: (T & { lane: number; lanes: number })[] = [];
    let laneEnds: number[] = [];
    let clusterEnd = -1;

    const closeCluster = () => {
        for (const item of cluster) item.lanes = laneEnds.length;
        result.push(...cluster);
        cluster = [];
        laneEnds = [];
    };

    for (const item of sorted) {
        if (item.start >= clusterEnd) closeCluster();
        let lane = laneEnds.findIndex((end) => end <= item.start);
        if (lane === -1) lane = laneEnds.length;
        laneEnds[lane] = item.end;
        clusterEnd = Math.max(clusterEnd, item.end);
        cluster.push({ ...item, lane, lanes: 1 });
    }
    closeCluster();
    return result;
}

export function hourRange(
    availabilities: readonly Availability[],
    days: readonly CalendarDay[],
): { start: number; end: number } {
    const minutes = [
        ...availabilities.flatMap((slot) => [toMinutes(slot.startTime), toMinutes(slot.endTime)]),
        ...days.flatMap((day) => day.blocks.flatMap((block) => [block.start, block.end])),
    ];
    if (minutes.length === 0) return DEFAULT_HOURS;

    const start = Math.max(0, Math.floor(Math.min(...minutes) / 60));
    const end = Math.min(24, Math.ceil(Math.max(...minutes) / 60));
    return end > start ? { start, end } : DEFAULT_HOURS;
}

function reservationBlock(reservation: Reservation, requiresApproval: boolean) {
    const state = getReservationState(reservation, requiresApproval);
    const time = `${formatHm(reservation.startTime)}–${formatHm(reservation.endTime)}`;
    const title = formatUserName(reservation.createdBy.by);
    const detail = reservation.purpose ?? "";
    const tooltip = [time, reservationStateLabel(state), title, detail, reservation.reason ?? ""]
        .filter(Boolean)
        .join(" · ");
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

function eventBlock(event: EventInfo, startTime: string, endTime: string) {
    const time = `${formatHm(startTime)}–${formatHm(endTime)}`;
    const title = event.isClosed ? `Closed: ${event.name}` : event.name;
    return {
        id: event.id,
        kind: event.isClosed ? ("closed" as const) : ("event" as const),
        start: toMinutes(startTime),
        end: toMinutes(endTime),
        time,
        title,
        detail: "",
        tooltip: `${time} · ${title}`,
    };
}

export function buildCalendarDays(options: {
    weekStart: Date;
    now: Date;
    reservations: readonly Reservation[];
    events: readonly EventInfo[];
    availabilities: readonly Availability[];
    requiresApproval: boolean;
}): CalendarDay[] {
    const todayIso = toIsoDate(options.now);

    return Array.from({ length: 7 }, (_, index) => {
        const date = addDays(options.weekStart, index);
        const iso = toIsoDate(date);
        const eventsToday = options.events.filter(
            (event) => event.startDate <= iso && iso <= event.endDate,
        );

        const allDay: CalendarAllDay[] = eventsToday
            .filter((event) => !event.startTime || !event.endTime)
            .map((event) => ({ id: event.id, title: event.name, isClosed: event.isClosed }));

        const blocks: Omit<CalendarBlock, "lane" | "lanes">[] = [
            ...options.reservations
                .filter((reservation) => reservation.date === iso)
                .map((reservation) => reservationBlock(reservation, options.requiresApproval)),
            ...eventsToday
                .filter((event) => event.startTime && event.endTime)
                .map((event) => eventBlock(event, event.startTime ?? "", event.endTime ?? "")),
        ];

        return {
            date,
            iso,
            isToday: iso === todayIso,
            openIntervals: slotsForDay(options.availabilities, date.getDay()).map((slot) => ({
                start: toMinutes(slot.startTime),
                end: toMinutes(slot.endTime),
            })),
            allDay,
            blocks: layoutLanes(blocks),
        };
    });
}
