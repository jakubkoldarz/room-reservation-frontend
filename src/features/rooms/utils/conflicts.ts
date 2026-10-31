import { HttpStatusCode } from "axios";
import { z } from "zod";
import type { ApiError } from "@/api/errors";
import { ConflictingReservationSchema, ConflictingRoomSchema } from "../schemas";
import type { ConflictingReservation, ConflictingRoom } from "../types";

export function isConflict(error: ApiError): boolean {
    return error.kind === "http" && error.status === HttpStatusCode.Conflict;
}

function conflictingItems<T>(error: ApiError, schema: z.ZodType<T>): T[] {
    if (error.kind !== "http" || !isConflict(error) || error.conflictingItems.length === 0)
        return [];
    const parsed = z.array(schema).safeParse(error.conflictingItems);
    return parsed.success ? parsed.data : [];
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
