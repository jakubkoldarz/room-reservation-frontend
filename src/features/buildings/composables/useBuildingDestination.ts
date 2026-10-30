import type { RouteLocationRaw } from "vue-router";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { buildingRoutes } from "../routes";

export function useBuildingDestination() {
    const { hasPermission } = usePermissions();

    return (buildingId: string): RouteLocationRaw =>
        hasPermission(Permission.BuildingView)
            ? { name: buildingRoutes.view.name, params: { buildingId } }
            : { name: buildingRoutes.list.name };
}
