import {
    reservationPeriodRange,
    reservationStatusCode,
} from "@/features/reservations/utils/reservationQueries";
import type { MyReservationsQuery } from "../types";

export function toMyReservationQueries(query: MyReservationsQuery, pageSize: number, today: Date) {
    return {
        Status: reservationStatusCode(query.status),
        ...reservationPeriodRange(query.when, today),
        Page: query.page,
        PageSize: pageSize,
    };
}
