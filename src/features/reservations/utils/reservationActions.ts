import type {
    ModeratorPermissions,
    Reservation,
    ReservationAction,
    ReservationState,
} from "../types";
import { toIsoDate } from "@/utils/isoDate";

function twoDigits(value: number): string {
    return String(value).padStart(2, "0");
}

function currentHm(now: Date): string {
    const hours = twoDigits(now.getHours());
    const minutes = twoDigits(now.getMinutes());
    return `${hours}:${minutes}`;
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

export function moderatorReservationActions(
    state: ReservationState,
    reservation: Pick<Reservation, "date" | "startTime">,
    now: Date,
    permissions: ModeratorPermissions,
): ReservationAction[] {
    const actions: ReservationAction[] = [];
    if (hasStarted(reservation, now)) return actions;

    if (state === "pending" && permissions.canApprove) actions.push("approve");
    if (state === "pending" && permissions.canReject) actions.push("reject");
    if (state === "approved" && permissions.canForceCancel) actions.push("forceCancel");
    return actions;
}

export function calendarBlockActions(
    state: ReservationState,
    reservation: Pick<Reservation, "date" | "startTime">,
    now: Date,
    isOwn: boolean,
    permissions: ModeratorPermissions,
): ReservationAction[] {
    const actions: ReservationAction[] = [];
    if (isOwn) {
        for (const action of ownReservationActions(state, reservation, now)) {
            actions.push(action);
        }
    }

    for (const action of moderatorReservationActions(state, reservation, now, permissions)) {
        const isDuplicateCancel = action === "forceCancel" && actions.includes("cancel");
        if (!isDuplicateCancel) actions.push(action);
    }
    return actions;
}

export function isOwnReservation(reservation: Reservation, userId: string | undefined): boolean {
    return !!userId && reservation.createdBy.by.id === userId;
}
