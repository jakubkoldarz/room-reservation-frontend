import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { EventListQuerySchema } from "./schemas";

export type EventInfo = z.infer<typeof schemas.EventResponseDto>;
export type EventListQuery = z.infer<typeof EventListQuerySchema>;

export type EventPeriod = "upcoming" | "ongoing" | "past";
