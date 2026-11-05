import type { schemas } from "@/api/generated";
import type { z } from "zod";

export type Reservation = z.infer<typeof schemas.ReservationResponseDto>;

export type ReservationState = "approved" | "pending" | "rejected" | "canceled";
