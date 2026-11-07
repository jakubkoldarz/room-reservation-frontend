import { formatHm } from "@/features/availabilities/utils/schedule";
import type {
    Reservation,
    ReservationDetailRow,
    ReservationRoom,
    ReservationState,
} from "../types";
import { formatUserName } from "./reservationState";

type Actor = Reservation["createdBy"];

const dateFormat = new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
});

const actionTimeFormat = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export function formatReservationDate(isoDate: string): string {
    const [year, month, day] = isoDate.split("-").map(Number);
    return dateFormat.format(new Date(year, month - 1, day));
}

export function formatReservationTime(
    reservation: Pick<Reservation, "startTime" | "endTime">,
): string {
    return `${formatHm(reservation.startTime)}–${formatHm(reservation.endTime)}`;
}

export function formatActionTime(at: string): string {
    return actionTimeFormat.format(new Date(at));
}

function actorRow(label: string, actor: Actor | null | undefined): ReservationDetailRow[] {
    if (!actor) return [];
    return [{ label, value: `${formatUserName(actor.by)}, ${formatActionTime(actor.at)}` }];
}

const REASON_LABELS: Record<ReservationState, string> = {
    approved: "Reason",
    pending: "Reason",
    rejected: "Rejection reason",
    canceled: "Cancellation reason",
};

export function reservationDetailRows(
    reservation: Reservation,
    state: ReservationState,
    room: ReservationRoom | null,
): ReservationDetailRow[] {
    return [
        { label: "Date", value: formatReservationDate(reservation.date) },
        { label: "Time", value: formatReservationTime(reservation) },
        ...(room ? [{ label: "Room", value: room.name }] : []),
        ...(room?.building ? [{ label: "Building", value: room.building }] : []),
        ...actorRow("Booked by", reservation.createdBy),
        ...actorRow("Approved by", reservation.approvedBy),
        ...actorRow("Rejected by", reservation.rejectedBy),
        ...actorRow("Canceled by", reservation.canceledBy),
        ...(reservation.purpose ? [{ label: "Purpose", value: reservation.purpose }] : []),
        ...(reservation.reason ? [{ label: REASON_LABELS[state], value: reservation.reason }] : []),
    ];
}
