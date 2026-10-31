import type { EventInfo } from "@/features/events/types";
import { toIsoDate } from "@/utils/isoDate";
import type { Availability, OpenStatus, WeekHoursGroup } from "../types";

export const DAYS_MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;

const OPEN_STATUS_SEARCH_DAYS = 90;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function formatHm(time: string): string {
    const [hours = "00", minutes = "00"] = time.split(":");
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

export function toMinutes(time: string): number {
    const [hours = "0", minutes = "0"] = time.split(":");
    return Number(hours) * 60 + Number(minutes);
}

export function slotsForDay(
    availabilities: readonly Availability[],
    dayOfWeek: number,
): Availability[] {
    return availabilities
        .filter((slot) => slot.dayOfWeek === dayOfWeek)
        .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));
}

export function eventOn(events: readonly EventInfo[], iso: string): EventInfo | undefined {
    return events.find((event) => event.startDate <= iso && iso <= event.endDate);
}

export function slotsForDate(
    availabilities: readonly Availability[],
    date: Date,
    events: readonly EventInfo[] = [],
): Availability[] {
    const dayOfWeek = date.getDay();
    const event = eventOn(events, toIsoDate(date));
    if (!event) return slotsForDay(availabilities, dayOfWeek);
    if (event.isClosed || !event.startTime || !event.endTime) return [];
    return [{ dayOfWeek, startTime: event.startTime, endTime: event.endTime }];
}

function slotRanges(availabilities: readonly Availability[], dayOfWeek: number): string[] {
    return slotsForDay(availabilities, dayOfWeek).map(
        (slot) => `${formatHm(slot.startTime)}–${formatHm(slot.endTime)}`,
    );
}

export function formatHours(availabilities: readonly Availability[], dayOfWeek: number): string {
    return slotRanges(availabilities, dayOfWeek).join(", ");
}

export function describeDay(availabilities: readonly Availability[], dayOfWeek: number): string {
    return `${DAY_NAMES[dayOfWeek]}: ${formatHours(availabilities, dayOfWeek) || "closed"}`;
}

export function groupWeek(availabilities: readonly Availability[]): WeekHoursGroup[] {
    const groups: { first: number; last: number; key: string; ranges: string[] }[] = [];
    let previousKey = "";

    for (const dayOfWeek of DAYS_MONDAY_FIRST) {
        const ranges = slotRanges(availabilities, dayOfWeek);
        const key = ranges.join(", ");
        const current = groups[groups.length - 1];
        if (key && key === previousKey && current) current.last = dayOfWeek;
        else if (key) groups.push({ first: dayOfWeek, last: dayOfWeek, key, ranges });
        previousKey = key;
    }

    return groups.map(({ first, last, key, ranges }) => ({
        key: `${first}-${key}`,
        days: first === last ? shortDay(first) : `${shortDay(first)}–${shortDay(last)}`,
        ranges,
    }));
}

function shortDay(dayOfWeek: number): string {
    return DAY_NAMES[dayOfWeek].slice(0, 3);
}

export function getOpenStatus(
    availabilities: readonly Availability[],
    now: Date,
    events: readonly EventInfo[] = [],
): OpenStatus {
    const minutes = now.getHours() * 60 + now.getMinutes();
    const dateAhead = (days: number) =>
        new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);

    for (const slot of slotsForDate(availabilities, now, events)) {
        if (toMinutes(slot.startTime) <= minutes && minutes < toMinutes(slot.endTime)) {
            return { kind: "open", until: formatHm(slot.endTime) };
        }
    }

    for (let daysAhead = 0; daysAhead <= OPEN_STATUS_SEARCH_DAYS; daysAhead++) {
        const date = dateAhead(daysAhead);
        const next = slotsForDate(availabilities, date, events).find(
            (slot) => daysAhead > 0 || toMinutes(slot.startTime) > minutes,
        );
        if (next) {
            return {
                kind: "opens",
                dayOfWeek: date.getDay(),
                daysAhead,
                at: formatHm(next.startTime),
            };
        }
    }

    return { kind: "never" };
}

export function describeOpenStatus(status: OpenStatus): string {
    switch (status.kind) {
        case "open":
            return `Open now · until ${status.until}`;
        case "opens": {
            const when =
                status.daysAhead === 0
                    ? "today"
                    : status.daysAhead === 1
                      ? "tomorrow"
                      : status.daysAhead < 7
                        ? shortDay(status.dayOfWeek)
                        : `in ${status.daysAhead} days`;
            return `Closed · opens ${when} ${status.at}`;
        }
        case "never":
            return "No opening hours";
    }
}
