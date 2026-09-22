import type apiClient from "@/api/client";

export type UserDetails = Awaited<ReturnType<typeof apiClient.getAuthme>>;
export type BuildingDetails = Awaited<ReturnType<typeof apiClient.getBuildingsBuildingId>>;
