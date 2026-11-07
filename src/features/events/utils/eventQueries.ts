import { z } from "zod";
import { addDays, parseIsoDate } from "@/features/rooms/utils/calendar";
import { toIsoDate } from "@/utils/isoDate";
import type { EventListQuery } from "../types";

const uuid = z.string().uuid();

function uuidOrUndefined(value: string): string | undefined {
    return uuid.safeParse(value).success ? value : undefined;
}

function dateRange(query: EventListQuery, today: Date): { DateFrom?: string; DateTo?: string } {
    if (parseIsoDate(query.date)) return { DateFrom: query.date, DateTo: query.date };
    if (query.when === "past") return { DateTo: toIsoDate(addDays(today, -1)) };
    if (query.when === "all") return {};
    return { DateFrom: toIsoDate(today) };
}

function closedFilter(type: string): boolean | undefined {
    if (type === "closed") return true;
    if (type === "hours") return false;
    return undefined;
}

export function toEventQueries(query: EventListQuery, pageSize: number, today: Date) {
    return {
        Name: query.name.trim() || undefined,
        BuildingId: uuidOrUndefined(query.building),
        RoomId: uuidOrUndefined(query.room),
        IsClosed: closedFilter(query.type),
        ...dateRange(query, today),
        Page: query.page,
        PageSize: pageSize,
    };
}
