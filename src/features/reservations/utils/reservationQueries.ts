import { z } from "zod";
import { addDays, parseIsoDate } from "@/features/rooms/utils/calendar";
import { toIsoDate } from "@/utils/isoDate";
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

export const RESERVATION_PERIOD_OPTIONS = [
    { value: "upcoming", label: "Today and upcoming" },
    { value: "past", label: "Past" },
    { value: "all", label: "All" },
];

export function reservationPeriodRange(
    when: string,
    today: Date,
): { DateFrom?: string; DateTo?: string } {
    if (when === "past") return { DateTo: toIsoDate(addDays(today, -1)) };
    if (when === "all") return {};
    return { DateFrom: toIsoDate(today) };
}

export function isPastFirst(when: string): boolean {
    return when === "past" || when === "all";
}

export function toReservationQueries(query: ReservationListQuery, pageSize: number, today: Date) {
    let date: string | undefined;
    if (parseIsoDate(query.date)) date = query.date;

    const filters = {
        Status: reservationStatusCode(query.status),
        Date: date,
        BuildingId: uuidOrUndefined(query.building),
        RoomId: uuidOrUndefined(query.room),
        CreatedById: uuidOrUndefined(query.createdBy),
        ApprovedById: uuidOrUndefined(query.approvedBy),
        CanceledById: uuidOrUndefined(query.canceledBy),
        Page: query.page,
        PageSize: pageSize,
    };

    if (date) return filters;

    const period = reservationPeriodRange(query.when, today);
    return { ...filters, ...period };
}
