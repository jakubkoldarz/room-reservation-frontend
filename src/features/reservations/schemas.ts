import { z } from "zod";
import { pageParam, textParam } from "@/composables/useListQuery";

export const REASON_MAX_LENGTH = 100;

export const ReservationListQuerySchema = z.object({
    page: pageParam,
    status: textParam,
    date: textParam,
    building: textParam,
    room: textParam,
    createdBy: textParam,
    approvedBy: textParam,
    canceledBy: textParam,
});
