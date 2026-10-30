import type { Availability, OpenStatus } from "../types";

export const DAYS_MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0] as const;

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

export function formatHours(availabilities: readonly Availability[], dayOfWeek: number): string {
    return slotsForDay(availabilities, dayOfWeek)
        .map((slot) => `${formatHm(slot.startTime)}–${formatHm(slot.endTime)}`)
        .join(", ");
}

export function describeDay(availabilities: readonly Availability[], dayOfWeek: number): string {
    return `${DAY_NAMES[dayOfWeek]}: ${formatHours(availabilities, dayOfWeek) || "closed"}`;
}

export function summarizeWeek(availabilities: readonly Availability[]): string {
    const groups: { first: number; last: number; hours: string }[] = [];
    let previousHours = "";

    for (const dayOfWeek of DAYS_MONDAY_FIRST) {
        const hours = formatHours(availabilities, dayOfWeek);
        const current = groups[groups.length - 1];
        if (hours && hours === previousHours && current) current.last = dayOfWeek;
        else if (hours) groups.push({ first: dayOfWeek, last: dayOfWeek, hours });
        previousHours = hours;
    }

    if (groups.length === 0) return "Closed all week";
    return groups
        .map(({ first, last, hours }) => {
            const days = first === last ? shortDay(first) : `${shortDay(first)}–${shortDay(last)}`;
            return `${days} ${hours}`;
        })
        .join(" · ");
}

function shortDay(dayOfWeek: number): string {
    return DAY_NAMES[dayOfWeek].slice(0, 3);
}

export function getOpenStatus(availabilities: readonly Availability[], now: Date): OpenStatus {
    const today = now.getDay();
    const minutes = now.getHours() * 60 + now.getMinutes();

    for (const slot of slotsForDay(availabilities, today)) {
        if (toMinutes(slot.startTime) <= minutes && minutes < toMinutes(slot.endTime)) {
            return { kind: "open", until: formatHm(slot.endTime) };
        }
    }

    for (let daysAhead = 0; daysAhead <= 7; daysAhead++) {
        const dayOfWeek = (today + daysAhead) % 7;
        const next = slotsForDay(availabilities, dayOfWeek).find(
            (slot) => daysAhead > 0 || toMinutes(slot.startTime) > minutes,
        );
        if (next) return { kind: "opens", dayOfWeek, daysAhead, at: formatHm(next.startTime) };
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
                      : shortDay(status.dayOfWeek);
            return `Closed · opens ${when} ${status.at}`;
        }
        case "never":
            return "No opening hours";
    }
}
