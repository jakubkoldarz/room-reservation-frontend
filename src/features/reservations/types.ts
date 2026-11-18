import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { ReservationFormSchema, ReservationListQuerySchema } from "./schemas";

export type Reservation = z.infer<typeof schemas.ReservationResponseDto>;
export type ReservationListItem = z.infer<typeof schemas.ReservationListItemResponseDto>;
export type ReservationListQuery = z.infer<typeof ReservationListQuerySchema>;

export type ReservationState = "approved" | "pending" | "rejected" | "canceled" | "expired";

export type ReservationRoom = {
    name: string;
    building: string;
};

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

export type ReservationAction =
    "edit" | "withdraw" | "cancel" | "approve" | "reject" | "forceCancel";

export type ModeratorPermissions = {
    canApprove: boolean;
    canReject: boolean;
    canForceCancel: boolean;
};

export type ReservationTimeRange = {
    startTime: string;
    endTime: string;
};
