import type { ReservationListItem } from "@/features/reservations/types";
import { getReservationState } from "@/features/reservations/utils/reservationState";
import { minutesToHm, parseIsoDate } from "@/features/rooms/utils/calendar";
import { toIsoDate } from "@/utils/isoDate";
import type { DateTile } from "../types";

const weekdayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "short" });

function stamp(isoDate: string, time: string): string {
    return `${isoDate} ${time.slice(0, 5)}`;
}

function nowStamp(now: Date): string {
    return stamp(toIsoDate(now), minutesToHm(now.getHours() * 60 + now.getMinutes()));
}

function isActive(item: ReservationListItem): boolean {
    const state = getReservationState(item.reservationInfo, item.roomInfo.requiresApproval);
    return state === "pending" || state === "approved";
}

export function upcomingReservations(
    items: readonly ReservationListItem[],
    now: Date,
    limit: number,
): ReservationListItem[] {
    const current = nowStamp(now);
    return items
        .filter(
            (item) =>
                isActive(item) &&
                stamp(item.reservationInfo.date, item.reservationInfo.endTime) > current,
        )
        .sort((a, b) =>
            stamp(a.reservationInfo.date, a.reservationInfo.startTime).localeCompare(
                stamp(b.reservationInfo.date, b.reservationInfo.startTime),
            ),
        )
        .slice(0, limit);
}

export function dateTile(isoDate: string): DateTile {
    const date = parseIsoDate(isoDate);
    if (!date) return { weekday: "", day: "?", month: "" };
    return {
        weekday: weekdayFormat.format(date),
        day: String(date.getDate()),
        month: monthFormat.format(date),
    };
}
