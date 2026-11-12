import { HttpStatusCode } from "axios";
import { z } from "zod";
import type { ApiError } from "@/api/errors";
import type { ConfirmItem } from "@/features/modal/types";
import {
    formatReservationDate,
    formatReservationTime,
} from "@/features/reservations/utils/reservationDetails";
import type { ReservationState } from "@/features/reservations/types";
import { reservationStateLabel } from "@/features/reservations/utils/reservationState";
import { ConflictingReservationSchema, ConflictingRoomSchema } from "../schemas";
import type { ConflictingReservation, ConflictingRoom } from "../types";

export function isConflict(error: ApiError): boolean {
    return error.kind === "http" && error.status === HttpStatusCode.Conflict;
}

export function conflictingItems<T>(error: ApiError, schema: z.ZodType<T>): T[] {
    if (error.kind !== "http") return [];
    if (!isConflict(error)) return [];
    if (error.conflictingItems.length === 0) return [];

    const parsed = z.array(schema).safeParse(error.conflictingItems);
    if (!parsed.success) return [];
    return parsed.data;
}

export function reservationConflicts(error: ApiError): ConflictingReservation[] {
    return conflictingItems(error, ConflictingReservationSchema);
}

export function roomConflicts(error: ApiError): ConflictingRoom[] {
    return conflictingItems(error, ConflictingRoomSchema);
}

export function reservationsAffectedMessage(count: number): string {
    if (count === 1) return "1 upcoming reservation will be canceled and its owner notified.";
    return `${count} upcoming reservations will be canceled and their owners notified.`;
}

function compareConflicts(a: ConflictingReservation, b: ConflictingReservation): number {
    const byDate = a.date.localeCompare(b.date);
    if (byDate !== 0) return byDate;

    const byStartTime = a.startTime.localeCompare(b.startTime);
    if (byStartTime !== 0) return byStartTime;

    return a.roomId.localeCompare(b.roomId);
}

export function reservationConflictItems(
    conflicts: readonly ConflictingReservation[],
    roomName: (roomId: string) => string | undefined,
): ConfirmItem[] {
    const sorted = [...conflicts].sort(compareConflicts);
    const items: ConfirmItem[] = [];

    for (const conflict of sorted) {
        const date = formatReservationDate(conflict.date);
        const time = formatReservationTime(conflict);
        const when = `${date}, ${time}`;

        let primary = when;
        const room = roomName(conflict.roomId);
        if (room) primary = `${room} · ${when}`;

        let state: ReservationState = "approved";
        if (conflict.status.toLowerCase().includes("pend")) state = "pending";

        items.push({ primary, secondary: reservationStateLabel(state) });
    }

    return items;
}
