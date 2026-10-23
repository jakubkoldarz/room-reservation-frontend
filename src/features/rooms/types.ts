import type { schemas } from "@/api/generated";
import type { z } from "zod";

export type BasicRoom = z.infer<typeof schemas.BasicRoomResponseDto>;
export type RoomDetails = z.infer<typeof schemas.RoomResponseDto>;
export type RoomSummary = z.infer<typeof schemas.RoomDetailsResponseDto>;
export type RoomRequest = z.input<typeof schemas.RoomRequestDto>;
