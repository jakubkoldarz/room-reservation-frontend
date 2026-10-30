import type { User } from "@/features/users/types";
import type { Reservation, ReservationState } from "../types";

const STATE_LABELS: Record<ReservationState, string> = {
    approved: "Confirmed",
    pending: "Waiting for approval",
    rejected: "Rejected",
    canceled: "Canceled",
};

export function getReservationState(
    reservation: Reservation,
    requiresApproval: boolean,
): ReservationState {
    const status = reservation.status?.toLowerCase() ?? "";
    if (status.includes("cancel")) return "canceled";
    if (status.includes("reject")) return "rejected";
    if (status.includes("pend")) return "pending";
    if (status.includes("approv") || status.includes("confirm")) return "approved";

    if (reservation.canceledBy) return "canceled";
    if (reservation.rejectedBy) return "rejected";
    if (reservation.approvedBy || !requiresApproval) return "approved";
    return "pending";
}

export function reservationStateLabel(state: ReservationState): string {
    return STATE_LABELS[state];
}

export function formatUserName(user: User): string {
    return [user.firstname, user.lastname].filter(Boolean).join(" ") || "Unknown user";
}
