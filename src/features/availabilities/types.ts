import type { schemas } from "@/api/generated";
import { z } from "zod";

export type Availability = z.infer<typeof schemas.AvailabilityRequestDto>;

export type OpenStatus =
    | { kind: "open"; until: string }
    | { kind: "opens"; dayOfWeek: number; daysAhead: number; at: string }
    | { kind: "never" };

export type WeekHoursGroup = { key: string; days: string; ranges: string[] };

export type DayMessages = Partial<Record<number, string>>;
