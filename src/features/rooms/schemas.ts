import { z } from "zod";
import { schemas } from "@/api/generated";
import { pageParam, textParam } from "@/composables/useListQuery";

export const MAX_ROOM_EQUIPMENT = 5;

export const ConflictingReservationSchema = z.object({
    reservationId: z.string(),
    date: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    roomId: z.string(),
    status: z.string(),
});

export const ConflictingRoomSchema = z.object({
    roomId: z.string(),
    identifier: z.string(),
});

export const RoomListQuerySchema = z.object({
    page: pageParam,
    identifier: textParam,
    building: textParam,
    floor: textParam,
    capacity: textParam,
    equipment: textParam,
    day: textParam,
    from: textParam,
    to: textParam,
});

export const RoomFormSchema = schemas.RoomRequestDto.omit({
    equipmentIds: true,
    availabilities: true,
}).extend({
    identifier: z
        .string({ required_error: "Identifier is required" })
        .trim()
        .min(1, "Identifier is required")
        .max(50, "Identifier can have at most 50 characters"),
    buildingId: z.string({ required_error: "Building is required" }).uuid("Building is required"),
    floor: z
        .number({ required_error: "Floor is required", invalid_type_error: "Floor is required" })
        .int("Floor must be a whole number"),
    capacity: z
        .number({
            required_error: "Capacity is required",
            invalid_type_error: "Capacity is required",
        })
        .int("Capacity must be a whole number")
        .min(1, "Capacity must be at least 1"),
});
