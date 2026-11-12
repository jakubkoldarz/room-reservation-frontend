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

function compareByStartTime(a: Availability, b: Availability): number {
    return toMinutes(a.startTime) - toMinutes(b.startTime);
}

export function slotsForDay(
    availabilities: readonly Availability[],
    dayOfWeek: number,
): Availability[] {
    const slots = availabilities.filter((slot) => slot.dayOfWeek === dayOfWeek);
    slots.sort(compareByStartTime);
    return slots;
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
    const ranges: string[] = [];
    for (const slot of slotsForDay(availabilities, dayOfWeek)) {
        ranges.push(`${formatHm(slot.startTime)}–${formatHm(slot.endTime)}`);
    }
    return ranges;
}

export function formatHours(availabilities: readonly Availability[], dayOfWeek: number): string {
    return slotRanges(availabilities, dayOfWeek).join(", ");
}

export function describeDay(availabilities: readonly Availability[], dayOfWeek: number): string {
    let hours = formatHours(availabilities, dayOfWeek);
    if (hours === "") hours = "closed";
    return `${DAY_NAMES[dayOfWeek]}: ${hours}`;
}

function shortDay(dayOfWeek: number): string {
    return DAY_NAMES[dayOfWeek].slice(0, 3);
}

export function groupWeek(availabilities: readonly Availability[]): WeekHoursGroup[] {
    const groups: { first: number; last: number; hours: string; ranges: string[] }[] = [];
    let previousHours = "";

    for (const dayOfWeek of DAYS_MONDAY_FIRST) {
        const ranges = slotRanges(availabilities, dayOfWeek);
        const hours = ranges.join(", ");
        const lastGroup = groups[groups.length - 1];
        const isOpen = hours !== "";

        if (isOpen && lastGroup && hours === previousHours) {
            lastGroup.last = dayOfWeek;
        } else if (isOpen) {
            groups.push({ first: dayOfWeek, last: dayOfWeek, hours, ranges });
        }
        previousHours = hours;
    }

    const result: WeekHoursGroup[] = [];
    for (const group of groups) {
        let days = shortDay(group.first);
        if (group.first !== group.last) {
            days = `${shortDay(group.first)}–${shortDay(group.last)}`;
        }
        result.push({ key: `${group.first}-${group.hours}`, days, ranges: group.ranges });
    }
    return result;
}

export function getOpenStatus(
    availabilities: readonly Availability[],
    now: Date,
    events: readonly EventInfo[] = [],
): OpenStatus {
    const minutesNow = now.getHours() * 60 + now.getMinutes();

    for (const slot of slotsForDate(availabilities, now, events)) {
        const hasOpened = toMinutes(slot.startTime) <= minutesNow;
        const hasClosed = toMinutes(slot.endTime) <= minutesNow;
        if (hasOpened && !hasClosed) {
            return { kind: "open", until: formatHm(slot.endTime) };
        }
    }

    for (let daysAhead = 0; daysAhead <= OPEN_STATUS_SEARCH_DAYS; daysAhead++) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysAhead);
        const isToday = daysAhead === 0;

        for (const slot of slotsForDate(availabilities, date, events)) {
            const alreadyStarted = isToday && toMinutes(slot.startTime) <= minutesNow;
            if (alreadyStarted) continue;

            return {
                kind: "opens",
                dayOfWeek: date.getDay(),
                daysAhead,
                at: formatHm(slot.startTime),
            };
        }
    }

    return { kind: "never" };
}

function describeOpeningDay(daysAhead: number, dayOfWeek: number): string {
    if (daysAhead === 0) return "today";
    if (daysAhead === 1) return "tomorrow";
    if (daysAhead < 7) return shortDay(dayOfWeek);
    return `in ${daysAhead} days`;
}

export function describeOpenStatus(status: OpenStatus): string {
    if (status.kind === "open") {
        return `Open now · until ${status.until}`;
    }
    if (status.kind === "opens") {
        const when = describeOpeningDay(status.daysAhead, status.dayOfWeek);
        return `Closed · opens ${when} ${status.at}`;
    }
    return "No opening hours";
}
