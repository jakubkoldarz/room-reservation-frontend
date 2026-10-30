import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { RoomFormSchema, RoomListQuerySchema } from "./schemas";

export type BasicRoom = z.infer<typeof schemas.BasicRoomResponseDto>;
export type RoomListItem = z.infer<typeof schemas.RoomListItemResponseDto>;
export type RoomDetails = z.infer<typeof schemas.RoomResponseDto>;
export type RoomSummary = z.infer<typeof schemas.RoomDetailsResponseDto>;
export type RoomRequest = z.input<typeof schemas.RoomRequestDto>;
export type RoomForm = z.infer<typeof RoomFormSchema>;
export type RoomListQuery = z.infer<typeof RoomListQuerySchema>;
