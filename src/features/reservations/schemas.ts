import { z } from "zod";
import { pageParam, textParam } from "@/composables/useListQuery";

export const REASON_MAX_LENGTH = 100;

export const ReservationListQuerySchema = z.object({
    page: pageParam,
    when: textParam,
    status: textParam,
    date: textParam,
    building: textParam,
    room: textParam,
    createdBy: textParam,
    approvedBy: textParam,
    canceledBy: textParam,
    sort: textParam,
});

export const PURPOSE_MAX_LENGTH = 100;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const ReservationTimesSchema = z.object({
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
});

function endsAfterStart(values: { startTime: string; endTime: string }): boolean {
    return (
        !TIME.test(values.startTime) ||
        !TIME.test(values.endTime) ||
        values.startTime < values.endTime
    );
}

const END_AFTER_START = { message: "End time must be after start time", path: ["endTime"] };

export const ReservationFormSchema = z
    .object({
        date: z.string({ required_error: "Date is required" }).regex(ISO_DATE, "Date is required"),
    })
    .merge(ReservationTimesSchema)
    .refine(endsAfterStart, END_AFTER_START);

export const ReservationEditFormSchema = ReservationTimesSchema.refine(
    endsAfterStart,
    END_AFTER_START,
);
