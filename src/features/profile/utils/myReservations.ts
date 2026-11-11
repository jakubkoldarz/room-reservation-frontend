import type { Reservation, ReservationState } from "@/features/reservations/types";
import { reservationStatusCode } from "@/features/reservations/utils/reservationQueries";
import { addDays } from "@/features/rooms/utils/calendar";
import { toIsoDate } from "@/utils/isoDate";
import type { MyReservationAction, MyReservationsQuery } from "../types";

function dateRange(when: string, today: Date): { DateFrom?: string; DateTo?: string } {
    if (when === "past") return { DateTo: toIsoDate(addDays(today, -1)) };
    if (when === "all") return {};
    return { DateFrom: toIsoDate(today) };
}

export function toMyReservationQueries(query: MyReservationsQuery, pageSize: number, today: Date) {
    return {
        Status: reservationStatusCode(query.status),
        ...dateRange(query.when, today),
        Page: query.page,
        PageSize: pageSize,
    };
}

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

export function myReservationAction(
    state: ReservationState,
    reservation: Pick<Reservation, "date" | "startTime">,
    now: Date,
): MyReservationAction | null {
    if (hasStarted(reservation, now)) return null;
    if (state === "pending") return "withdraw";
    if (state === "approved") return "cancel";
    return null;
}
