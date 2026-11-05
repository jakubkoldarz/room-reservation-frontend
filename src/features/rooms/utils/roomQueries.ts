import { z } from "zod";
import type { RoomListQuery } from "../types";

const uuid = z.string().uuid();
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function toInt(value: string): number | undefined {
    if (!value.trim()) return undefined;
    const number = Number(value);
    return Number.isInteger(number) ? number : undefined;
}

function isUuid(value: string): boolean {
    return uuid.safeParse(value).success;
}

function toTimeRange(query: RoomListQuery): { from: string; to: string } | undefined {
    if (!TIME.test(query.from) || !TIME.test(query.to) || query.from >= query.to) return undefined;
    return { from: query.from, to: query.to };
}

export function timeRangeError(query: RoomListQuery): string | null {
    const hasFrom = query.from !== "";
    const hasTo = query.to !== "";
    if (!hasFrom && !hasTo) return null;
    if (hasFrom !== hasTo) return "Set both opening times to filter by hours.";
    if (!toTimeRange(query)) return '"Open from" must be earlier than "Open until".';
    return null;
}

export function toRoomQueries(query: RoomListQuery, pageSize: number) {
    const capacity = toInt(query.capacity);
    const day = toInt(query.day);
    const equipmentIds = query.equipment.split(",").filter(isUuid);
    const timeRange = toTimeRange(query);

    return {
        Identifier: query.identifier.trim() || undefined,
        BuildingId: isUuid(query.building) ? query.building : undefined,
        Floor: toInt(query.floor),
        MinCapacity: capacity !== undefined && capacity >= 1 ? capacity : undefined,
        DayOfWeek: day !== undefined && day >= 0 && day <= 6 ? day : undefined,
        StartTime: timeRange?.from,
        EndTime: timeRange?.to,
        EquipmentIds: equipmentIds.length > 0 ? equipmentIds : undefined,
        Page: query.page,
        PageSize: pageSize,
    };
}
