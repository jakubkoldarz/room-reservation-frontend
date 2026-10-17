import type { schemas } from "@/api/generated";
import type { z } from "zod";

export type Building = z.infer<typeof schemas.BasicBuildingResponseDto>;
export type BuildingDetails = z.infer<typeof schemas.BuildingDetailsResponseDto>;
export type BuildingRequest = z.input<typeof schemas.BuildingRequestDto>;
