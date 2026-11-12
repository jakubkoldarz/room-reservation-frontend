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

function addActorRow(
    rows: ReservationDetailRow[],
    label: string,
    actor: Actor | null | undefined,
): void {
    if (!actor) return;

    const name = formatUserName(actor.by);
    const time = formatActionTime(actor.at);
    rows.push({ label, value: `${name}, ${time}` });
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
    const rows: ReservationDetailRow[] = [];

    rows.push({ label: "Date", value: formatReservationDate(reservation.date) });
    rows.push({ label: "Time", value: formatReservationTime(reservation) });

    if (room) {
        rows.push({ label: "Room", value: room.name });
    }
    if (room && room.building) {
        rows.push({ label: "Building", value: room.building });
    }

    addActorRow(rows, "Booked by", reservation.createdBy);
    addActorRow(rows, "Approved by", reservation.approvedBy);
    addActorRow(rows, "Rejected by", reservation.rejectedBy);
    addActorRow(rows, "Canceled by", reservation.canceledBy);

    if (reservation.purpose) {
        rows.push({ label: "Purpose", value: reservation.purpose });
    }
    if (reservation.reason) {
        rows.push({ label: REASON_LABELS[state], value: reservation.reason });
    }

    return rows;
}
