import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { Reservation, ReservationRoom, ReservationState } from "@/features/reservations/types";
import type {
    ConflictingReservationSchema,
    ConflictingRoomSchema,
    RoomFormSchema,
    RoomListQuerySchema,
} from "./schemas";

export type BasicRoom = z.infer<typeof schemas.BasicRoomResponseDto>;
export type RoomListItem = z.infer<typeof schemas.RoomListItemResponseDto>;
export type RoomDetails = z.infer<typeof schemas.RoomResponseDto>;
export type RoomSummary = z.infer<typeof schemas.RoomDetailsResponseDto>;
export type RoomRequest = z.input<typeof schemas.RoomRequestDto>;
export type RoomForm = z.infer<typeof RoomFormSchema>;
export type RoomListQuery = z.infer<typeof RoomListQuerySchema>;
export type ConflictingReservation = z.infer<typeof ConflictingReservationSchema>;
export type ConflictingRoom = z.infer<typeof ConflictingRoomSchema>;

export type CalendarBlockKind = ReservationState | "event" | "closed";

export type CalendarBlock = {
    id: string;
    kind: ReservationState;
    start: number;
    end: number;
    time: string;
    title: string;
    detail: string;
    reservation: Reservation;
    room: ReservationRoom | null;
    lane: number;
    lanes: number;
};

export type CalendarMore = {
    id: string;
    start: number;
    end: number;
    lane: number;
    lanes: number;
    count: number;
    tooltip: string;
};

export type CalendarAllDay = {
    id: string;
    title: string;
    isClosed: boolean;
    hours: string | null;
};

export type CalendarDay = {
    date: Date;
    iso: string;
    isToday: boolean;
    openIntervals: { start: number; end: number }[];
    allDay: CalendarAllDay[];
    blocks: CalendarBlock[];
    grid: { blocks: CalendarBlock[]; more: CalendarMore[] };
};

export type MinuteRange = {
    start: number;
    end: number;
};

export type CalendarSelection = MinuteRange & {
    iso: string;
};
