import type { ApiError } from "@/api/errors";
import { apiErrorMessage } from "@/api/errors";
import type { ReservationDraft } from "@/features/reservations/types";
import { minutesToHm, parseIsoDate, startOfWeek } from "@/features/rooms/utils/calendar";
import { toIsoDate } from "@/utils/isoDate";

const LAST_START_HOUR = 22;

export function defaultReservationDraft(now: Date): ReservationDraft {
    const startHour = Math.min(now.getHours() + 1, LAST_START_HOUR);
    return {
        date: toIsoDate(now),
        startTime: minutesToHm(startHour * 60),
        endTime: minutesToHm((startHour + 1) * 60),
    };
}

export function calendarWeekOf(isoDate: string): string | null {
    const day = parseIsoDate(isoDate);
    return day ? toIsoDate(startOfWeek(day)) : null;
}

export function reservationFailureMessage(error: ApiError): string {
    if (error.kind === "validation") return error.formErrors[0] ?? apiErrorMessage(error);
    return apiErrorMessage(error);
}

export function isAvailabilityFailure(error: ApiError): boolean {
    return error.kind === "http" && (error.status === 400 || error.status === 409);
}
