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

type EventDates = {
    startDate: string;
    endDate: string;
};

type EventTimes = {
    startTime?: string;
    endTime?: string;
};

function addError(ctx: z.RefinementCtx, field: string, message: string): void {
    ctx.addIssue({ code: "custom", path: [field], message });
}

function checkDates(values: EventDates, ctx: z.RefinementCtx, keptStartDate?: string): void {
    const today = toIsoDate(new Date());
    const hasStartDate = ISO_DATE.test(values.startDate);
    const hasEndDate = ISO_DATE.test(values.endDate);
    const keepsOldStartDate = keptStartDate !== undefined && values.startDate === keptStartDate;

    if (hasStartDate && values.startDate < today && !keepsOldStartDate) {
        addError(ctx, "startDate", "Start date can't be in the past");
    }
    if (hasEndDate && values.endDate < today) {
        addError(ctx, "endDate", "End date can't be in the past");
    }
    if (hasStartDate && hasEndDate && values.endDate < values.startDate) {
        addError(ctx, "endDate", "End date can't be before start date");
    }
}

function checkTimes(values: EventTimes, ctx: z.RefinementCtx): void {
    const startTime = values.startTime ?? "";
    const endTime = values.endTime ?? "";
    const hasStartTime = TIME.test(startTime);
    const hasEndTime = TIME.test(endTime);

    if (!hasStartTime) {
        addError(ctx, "startTime", "Start time is required");
    }
    if (!hasEndTime) {
        addError(ctx, "endTime", "End time is required");
    }
    if (hasStartTime && hasEndTime && startTime >= endTime) {
        addError(ctx, "endTime", "End time must be after start time");
    }
}

export function createEventFormSchema(keptStartDate?: string) {
    const fields = z.object({
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
    });

    return fields.superRefine((values, ctx) => {
        checkDates(values, ctx, keptStartDate);
        if (!values.isClosed) checkTimes(values, ctx);
    });
}

export const EventFormSchema = createEventFormSchema();

export const ConflictingEventSchema = z.object({
    eventId: z.string(),
    name: z.string(),
    startDate: z.string(),
    endDate: z.string(),
});
