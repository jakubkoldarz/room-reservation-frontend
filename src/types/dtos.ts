import type apiClient from "@/api/client";

export type UserDetails = Awaited<ReturnType<typeof apiClient.getAuthme>>;
export type BuildingDetails = Awaited<ReturnType<typeof apiClient.getBuildingsBuildingId>>;
export type BuildingInfo = {
    id: string;
    name: string;
    identifier?: string | null;
    floorsCount: string | number;
    city: string;
    street: string;
    postalCode: string;
};
