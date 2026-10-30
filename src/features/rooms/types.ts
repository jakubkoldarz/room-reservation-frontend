import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { ReservationState } from "@/features/reservations/types";
import type { RoomFormSchema, RoomListQuerySchema } from "./schemas";

export type BasicRoom = z.infer<typeof schemas.BasicRoomResponseDto>;
export type RoomListItem = z.infer<typeof schemas.RoomListItemResponseDto>;
export type RoomDetails = z.infer<typeof schemas.RoomResponseDto>;
export type RoomSummary = z.infer<typeof schemas.RoomDetailsResponseDto>;
export type RoomRequest = z.input<typeof schemas.RoomRequestDto>;
export type RoomForm = z.infer<typeof RoomFormSchema>;
export type RoomListQuery = z.infer<typeof RoomListQuerySchema>;

export type CalendarBlockKind = ReservationState | "event" | "closed";

export type CalendarBlock = {
    id: string;
    kind: CalendarBlockKind;
    start: number;
    end: number;
    time: string;
    title: string;
    detail: string;
    tooltip: string;
    lane: number;
    lanes: number;
};

export type CalendarAllDay = {
    id: string;
    title: string;
    isClosed: boolean;
};

export type CalendarDay = {
    date: Date;
    iso: string;
    isToday: boolean;
    openIntervals: { start: number; end: number }[];
    allDay: CalendarAllDay[];
    blocks: CalendarBlock[];
};
