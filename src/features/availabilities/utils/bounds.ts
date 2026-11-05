import type { Availability, DayMessages } from "../types";
import { formatHm, toMinutes } from "./schedule";

function range(slot: Availability): string {
    return `${formatHm(slot.startTime)}–${formatHm(slot.endTime)}`;
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

        const limit = bounds.find((slot) => slot.dayOfWeek === item.dayOfWeek);
        if (!limit) errors[item.dayOfWeek] = "The building is closed on this day";
        else if (start < toMinutes(limit.startTime) || end > toMinutes(limit.endTime))
            errors[item.dayOfWeek] = `Must be within building hours ${range(limit)}`;
    }
    return errors;
}

export function boundsHints(bounds: readonly Availability[] | null): DayMessages {
    if (!bounds) return {};
    const hints: DayMessages = {};
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const limit = bounds.find((slot) => slot.dayOfWeek === dayOfWeek);
        hints[dayOfWeek] = limit ? `Building open ${range(limit)}` : "Building closed";
    }
    return hints;
}

export function clampToBounds(
    items: readonly Availability[],
    bounds: readonly Availability[],
): Availability[] {
    return items.flatMap((item) => {
        const limit = bounds.find((slot) => slot.dayOfWeek === item.dayOfWeek);
        if (!limit) return [];
        const startTime =
            toMinutes(item.startTime) < toMinutes(limit.startTime)
                ? limit.startTime
                : item.startTime;
        const endTime =
            toMinutes(item.endTime) > toMinutes(limit.endTime) ? limit.endTime : item.endTime;
        return toMinutes(startTime) < toMinutes(endTime)
            ? [{ dayOfWeek: item.dayOfWeek, startTime, endTime }]
            : [];
    });
}
