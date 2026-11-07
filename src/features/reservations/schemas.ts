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

export const PURPOSE_MAX_LENGTH = 100;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const ReservationFormSchema = z
    .object({
        date: z.string({ required_error: "Date is required" }).regex(ISO_DATE, "Date is required"),
        startTime: z
            .string({ required_error: "Start time is required" })
            .regex(TIME, "Start time is required"),
        endTime: z
            .string({ required_error: "End time is required" })
            .regex(TIME, "End time is required"),
        purpose: z
            .string()
            .trim()
            .max(PURPOSE_MAX_LENGTH, `Purpose can have at most ${PURPOSE_MAX_LENGTH} characters`)
            .optional(),
    })
    .refine(
        (values) =>
            !TIME.test(values.startTime) ||
            !TIME.test(values.endTime) ||
            values.startTime < values.endTime,
        {
            message: "End time must be after start time",
            path: ["endTime"],
        },
    );
