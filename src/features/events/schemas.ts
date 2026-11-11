import { z } from "zod";
import { pageParam, textParam } from "@/composables/useListQuery";
import { toIsoDate } from "@/utils/isoDate";

export const EventListQuerySchema = z.object({
    page: pageParam,
    name: textParam,
    when: textParam,
    date: textParam,
    building: textParam,
    room: textParam,
    type: textParam,
    sort: textParam,
});

export const EVENT_NAME_MAX_LENGTH = 100;

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function createEventFormSchema(keptStartDate?: string) {
    return z
        .object({
            name: z
                .string({ required_error: "Name is required" })
                .trim()
                .min(1, "Name is required")
                .max(
                    EVENT_NAME_MAX_LENGTH,
                    `Name can have at most ${EVENT_NAME_MAX_LENGTH} characters`,
                ),
            startDate: z
                .string({ required_error: "Start date is required" })
                .regex(ISO_DATE, "Start date is required"),
            endDate: z
                .string({ required_error: "End date is required" })
                .regex(ISO_DATE, "End date is required"),
            isClosed: z.boolean(),
            startTime: z.string().optional(),
            endTime: z.string().optional(),
        })
        .superRefine((values, ctx) => {
            const today = toIsoDate(new Date());
            const keepsStartDate =
                keptStartDate !== undefined && values.startDate === keptStartDate;
            if (ISO_DATE.test(values.startDate) && values.startDate < today && !keepsStartDate) {
                ctx.addIssue({
                    code: "custom",
                    path: ["startDate"],
                    message: "Start date can't be in the past",
                });
            }
            if (ISO_DATE.test(values.endDate) && values.endDate < today) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endDate"],
                    message: "End date can't be in the past",
                });
            }
            if (
                ISO_DATE.test(values.startDate) &&
                ISO_DATE.test(values.endDate) &&
                values.endDate < values.startDate
            ) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endDate"],
                    message: "End date can't be before start date",
                });
            }
            if (values.isClosed) return;

            const startValid = TIME.test(values.startTime ?? "");
            const endValid = TIME.test(values.endTime ?? "");
            if (!startValid)
                ctx.addIssue({
                    code: "custom",
                    path: ["startTime"],
                    message: "Start time is required",
                });
            if (!endValid)
                ctx.addIssue({
                    code: "custom",
                    path: ["endTime"],
                    message: "End time is required",
                });
            if (startValid && endValid && values.startTime! >= values.endTime!) {
                ctx.addIssue({
                    code: "custom",
                    path: ["endTime"],
                    message: "End time must be after start time",
                });
            }
        });
}

export const EventFormSchema = createEventFormSchema();

export const ConflictingEventSchema = z.object({
    eventId: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
});
