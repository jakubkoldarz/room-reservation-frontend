import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { ReservationListQuerySchema } from "./schemas";

export type Reservation = z.infer<typeof schemas.ReservationResponseDto>;
export type ReservationListItem = z.infer<typeof schemas.ReservationListItemResponseDto>;
export type ReservationListQuery = z.infer<typeof ReservationListQuerySchema>;

export type ReservationState = "approved" | "pending" | "rejected" | "canceled";
