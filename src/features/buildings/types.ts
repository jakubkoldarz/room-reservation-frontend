import { schemas } from "@/api/generated";
import { z } from "zod";

export type Building = z.infer<typeof schemas.BasicBuildingResponseDto>;
export type BuildingDetails = z.infer<typeof schemas.BuildingDetailsResponseDto>;
