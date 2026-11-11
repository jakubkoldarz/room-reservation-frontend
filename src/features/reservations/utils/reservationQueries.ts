import { z } from "zod";
import { parseIsoDate } from "@/features/rooms/utils/calendar";
import type { ReservationListQuery, ReservationState } from "../types";

const STATUS_CODES: Record<ReservationState, number> = {
    pending: 0,
    approved: 1,
    rejected: 2,
    canceled: 3,
};

export const RESERVATION_STATES = Object.keys(STATUS_CODES) as ReservationState[];

const uuid = z.string().uuid();

function uuidOrUndefined(value: string): string | undefined {
    return uuid.safeParse(value).success ? value : undefined;
}

function isReservationState(value: string): value is ReservationState {
    return Object.hasOwn(STATUS_CODES, value);
}

export function reservationStatusCode(value: string): number | undefined {
    return isReservationState(value) ? STATUS_CODES[value] : undefined;
}

export function toReservationQueries(query: ReservationListQuery, pageSize: number) {
    return {
        Status: reservationStatusCode(query.status),
        Date: parseIsoDate(query.date) ? query.date : undefined,
        BuildingId: uuidOrUndefined(query.building),
        RoomId: uuidOrUndefined(query.room),
        CreatedById: uuidOrUndefined(query.createdBy),
        ApprovedById: uuidOrUndefined(query.approvedBy),
        CanceledById: uuidOrUndefined(query.canceledBy),
        Page: query.page,
        PageSize: pageSize,
    };
}
