import type { Availability, DayMessages } from "../types";
import { formatHm, toMinutes } from "./schedule";

const DAYS_IN_WEEK = 7;

function range(slot: Availability): string {
    return `${formatHm(slot.startTime)}–${formatHm(slot.endTime)}`;
}

function limitForDay(bounds: readonly Availability[], dayOfWeek: number): Availability | undefined {
    return bounds.find((slot) => slot.dayOfWeek === dayOfWeek);
}

export function availabilityErrors(
    items: readonly Availability[],
    bounds: readonly Availability[] | null,
): DayMessages {
    const errors: DayMessages = {};

    for (const item of items) {
        const start = toMinutes(item.startTime);
        const end = toMinutes(item.endTime);

        if (start >= end) {
            errors[item.dayOfWeek] = "Opening time must be before closing time";
            continue;
        }
        if (!bounds) continue;

        const limit = limitForDay(bounds, item.dayOfWeek);
        if (!limit) {
            errors[item.dayOfWeek] = "The building is closed on this day";
            continue;
        }

        const startsTooEarly = start < toMinutes(limit.startTime);
        const endsTooLate = end > toMinutes(limit.endTime);
        if (startsTooEarly || endsTooLate) {
            errors[item.dayOfWeek] = `Must be within building hours ${range(limit)}`;
        }
    }

    return errors;
}

export function boundsHints(bounds: readonly Availability[] | null): DayMessages {
    if (!bounds) return {};

    const hints: DayMessages = {};
    for (let dayOfWeek = 0; dayOfWeek < DAYS_IN_WEEK; dayOfWeek++) {
        const limit = limitForDay(bounds, dayOfWeek);
        if (limit) {
            hints[dayOfWeek] = `Building open ${range(limit)}`;
        } else {
            hints[dayOfWeek] = "Building closed";
        }
    }
    return hints;
}

export function clampToBounds(
    items: readonly Availability[],
    bounds: readonly Availability[],
): Availability[] {
    const clamped: Availability[] = [];

    for (const item of items) {
        const limit = limitForDay(bounds, item.dayOfWeek);
        if (!limit) continue;

        let startTime = item.startTime;
        if (toMinutes(startTime) < toMinutes(limit.startTime)) startTime = limit.startTime;

        let endTime = item.endTime;
        if (toMinutes(endTime) > toMinutes(limit.endTime)) endTime = limit.endTime;

        const isStillOpen = toMinutes(startTime) < toMinutes(endTime);
        if (isStillOpen) clamped.push({ dayOfWeek: item.dayOfWeek, startTime, endTime });
    }

    return clamped;
}
