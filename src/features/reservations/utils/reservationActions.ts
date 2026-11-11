import type { Reservation, ReservationAction, ReservationState } from "../types";
import { toIsoDate } from "@/utils/isoDate";

function currentHm(now: Date): string {
    const pad = (value: number) => String(value).padStart(2, "0");
    return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function hasStarted(
    reservation: Pick<Reservation, "date" | "startTime">,
    now: Date,
): boolean {
    const today = toIsoDate(now);
    if (reservation.date !== today) return reservation.date < today;
    return reservation.startTime.slice(0, 5) <= currentHm(now);
}

export function ownReservationActions(
    state: ReservationState,
    reservation: Pick<Reservation, "date" | "startTime">,
    now: Date,
): ReservationAction[] {
    if (hasStarted(reservation, now)) return [];
    if (state === "pending") return ["edit", "withdraw"];
    if (state === "approved") return ["edit", "cancel"];
    return [];
}

export function isOwnReservation(reservation: Reservation, userId: string | undefined): boolean {
    return !!userId && reservation.createdBy.by.id === userId;
}
