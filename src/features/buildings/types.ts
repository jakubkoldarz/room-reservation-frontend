import { schemas } from "@/api/generated";
import { z } from "zod";

export type Building = z.infer<typeof schemas.BasicBuildingResponseDto>;
export type BuildingDetails = z.infer<typeof schemas.BuildingDetailsResponseDto>;
export type BuildingsPage = z.infer<typeof schemas.PagedResultOfBasicBuildingResponseDto>;
export type BuildingsPageState = {
    value: Building[];
    totalPages: number;
    page: number;
};
