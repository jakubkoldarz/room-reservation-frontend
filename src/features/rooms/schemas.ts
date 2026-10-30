import { z } from "zod";
import { schemas } from "@/api/generated";

export const MAX_ROOM_EQUIPMENT = 5;

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
