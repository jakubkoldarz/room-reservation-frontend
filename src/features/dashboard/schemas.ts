import { z } from "zod";
import { PURPOSE_MAX_LENGTH } from "@/features/reservations/schemas";

function required(message: string) {
    return z.string({ required_error: message }).min(1, message);
}

export const QuickReservationFormSchema = z.object({
    roomId: required("Choose a room"),
    date: required("Date is required"),
    startTime: required("Start time is required"),
    endTime: required("End time is required"),
    purpose: z
        .string()
        .trim()
        .max(PURPOSE_MAX_LENGTH, `Purpose can have at most ${PURPOSE_MAX_LENGTH} characters`)
        .optional(),
});
