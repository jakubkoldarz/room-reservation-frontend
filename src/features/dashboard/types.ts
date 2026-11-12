import type { z } from "zod";
import type { QuickReservationFormSchema } from "./schemas";

export type QuickReservationForm = z.infer<typeof QuickReservationFormSchema>;

export type QuickReservationFailure = {
    message: string;
    roomId: string;
    roomName: string;
    date: string;
    canCheckCalendar: boolean;
};

export type DateTile = {
    weekday: string;
    day: string;
    month: string;
};
