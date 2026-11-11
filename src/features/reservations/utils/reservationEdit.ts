import type { Availability } from "@/features/availabilities/types";
import { formatHm, toMinutes } from "@/features/availabilities/utils/schedule";
import { toIsoDate } from "@/utils/isoDate";
import type { ReservationTimeRange } from "../types";

export function formatSlots(slots: readonly Availability[]): string {
    return slots.map((slot) => `${formatHm(slot.startTime)}–${formatHm(slot.endTime)}`).join(", ");
}

export function isSameTimeRange(a: ReservationTimeRange, b: ReservationTimeRange): boolean {
    return (
        formatHm(a.startTime) === formatHm(b.startTime) &&
        formatHm(a.endTime) === formatHm(b.endTime)
    );
}

export function editTimeProblem(options: {
    range: ReservationTimeRange;
    original: ReservationTimeRange;
    date: string;
    slots: readonly Availability[];
    others: readonly ReservationTimeRange[];
    now: Date;
}): string | null {
    const { range, original, date, slots, others, now } = options;
    const start = toMinutes(range.startTime);
    const end = toMinutes(range.endTime);
    if (!(start < end)) return null;

    const startChanged = formatHm(range.startTime) !== formatHm(original.startTime);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (startChanged && date === toIsoDate(now) && start <= nowMinutes) {
        return "This start time has already passed.";
    }

    if (slots.length === 0) return "The room is closed on this day.";

    const fits = slots.some(
        (slot) => toMinutes(slot.startTime) <= start && end <= toMinutes(slot.endTime),
    );
    if (!fits) return `Choose a time within the opening hours: ${formatSlots(slots)}.`;

    const overlap = others.find(
        (other) => start < toMinutes(other.endTime) && toMinutes(other.startTime) < end,
    );
    if (overlap) {
        return `This time overlaps another reservation (${formatHm(overlap.startTime)}–${formatHm(overlap.endTime)}).`;
    }

    return null;
}
