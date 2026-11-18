import { toMinutes } from "@/features/availabilities/utils/schedule";
import type {
    Reservation,
    ReservationDraft,
    ReservationState,
    ReservationTimeRange,
} from "../types";
import { isOwnReservation } from "./reservationActions";
import { getReservationState } from "./reservationState";

export function rangesOverlap(a: ReservationTimeRange, b: ReservationTimeRange): boolean {
    const aStart = toMinutes(a.startTime);
    const aEnd = toMinutes(a.endTime);
    const bStart = toMinutes(b.startTime);
    const bEnd = toMinutes(b.endTime);
    return aStart < bEnd && bStart < aEnd;
}

export function blocksNewReservation(
    state: ReservationState,
    reservation: Reservation,
    requiresApproval: boolean,
    userId: string | undefined,
): boolean {
    if (state === "approved") return true;
    if (state !== "pending") return false;
    if (!requiresApproval) return true;
    return isOwnReservation(reservation, userId);
}

export function isOtherUsersRequest(reservation: Reservation, userId: string | undefined): boolean {
    if (getReservationState(reservation, true) !== "pending") return false;
    return !isOwnReservation(reservation, userId);
}

export function waitingRequests(
    reservations: readonly Reservation[],
    draft: ReservationDraft,
    userId: string | undefined,
): Reservation[] {
    const result: Reservation[] = [];

    for (const reservation of reservations) {
        if (reservation.date !== draft.date) continue;
        if (!isOtherUsersRequest(reservation, userId)) continue;
        if (!rangesOverlap(reservation, draft)) continue;
        result.push(reservation);
    }

    return result;
}
