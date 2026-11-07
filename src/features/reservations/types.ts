import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { ReservationFormSchema, ReservationListQuerySchema } from "./schemas";

export type Reservation = z.infer<typeof schemas.ReservationResponseDto>;
export type ReservationListItem = z.infer<typeof schemas.ReservationListItemResponseDto>;
export type ReservationListQuery = z.infer<typeof ReservationListQuerySchema>;

export type ReservationState = "approved" | "pending" | "rejected" | "canceled";

export type ReservationDetailRow = {
    label: string;
    value: string;
};

export type ReservationForm = z.infer<typeof ReservationFormSchema>;

export type ReservationDraft = {
    date: string;
    startTime: string;
    endTime: string;
};
