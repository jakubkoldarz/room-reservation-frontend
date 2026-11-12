import type { ApiError } from "@/api/errors";
import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { ConflictingEventSchema, EventFormSchema, EventListQuerySchema } from "./schemas";

export type EventInfo = z.infer<typeof schemas.EventResponseDto>;
export type EventListQuery = z.infer<typeof EventListQuerySchema>;

export type EventPeriod = "upcoming" | "ongoing" | "past";
export type EventForm = z.infer<typeof EventFormSchema>;
export type ConflictingEvent = z.infer<typeof ConflictingEventSchema>;

export type GroupedRoom = {
    id: string;
    identifier: string;
    floor: number;
};

export type BuildingRoomGroup = {
    id: string;
    name: string;
    address: string;
    rooms: GroupedRoom[];
};

export type EventSaveOutcome =
    | { kind: "saved"; event: EventInfo }
    | { kind: "canceled" }
    | { kind: "overlap"; events: ConflictingEvent[] }
    | { kind: "failed"; error: ApiError };
