import { formatHm } from "@/features/availabilities/utils/schedule";
import { parseIsoDate } from "@/features/rooms/utils/calendar";
import type { EventInfo, EventPeriod } from "../types";

const DAY_MS = 24 * 60 * 60 * 1000;

const dayFormat = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
});
const yearFormat = new Intl.DateTimeFormat("en-GB", { year: "numeric" });

function toDate(isoDate: string): Date {
    return parseIsoDate(isoDate) ?? new Date(Number.NaN);
}

export function eventDayCount(event: Pick<EventInfo, "startDate" | "endDate">): number {
    return (
        Math.round((toDate(event.endDate).getTime() - toDate(event.startDate).getTime()) / DAY_MS) +
        1
    );
}

export function formatEventDates(event: Pick<EventInfo, "startDate" | "endDate">): string {
    const start = toDate(event.startDate);
    const end = toDate(event.endDate);
    const year = yearFormat.format(end);
    if (event.startDate === event.endDate) return `${dayFormat.format(start)} ${year}`;
    return `${dayFormat.format(start)} – ${dayFormat.format(end)} ${year}`;
}

export function eventHours(event: Pick<EventInfo, "isClosed" | "startTime" | "endTime">): string {
    if (event.isClosed || !event.startTime || !event.endTime) return "Closed";
    return `${formatHm(event.startTime)}–${formatHm(event.endTime)}`;
}

export function eventPeriod(
    event: Pick<EventInfo, "startDate" | "endDate">,
    todayIso: string,
): EventPeriod {
    if (event.endDate < todayIso) return "past";
    if (event.startDate > todayIso) return "upcoming";
    return "ongoing";
}
