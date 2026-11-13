import type { RouteLocationRaw } from "vue-router";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { buildingRoutes } from "@/features/buildings/routes";
import type { Building } from "@/features/buildings/types";
import { useRoomDestination } from "@/features/rooms/composables/useRoomDestination";
import { roomRoutes } from "@/features/rooms/routes";
import type { BasicRoom } from "@/features/rooms/types";
import type { SearchLinks } from "../types";

export function useSearchLinks(): SearchLinks {
    const { hasPermission } = usePermissions();
    const { roomLink } = useRoomDestination();

    function roomList(term: string): RouteLocationRaw {
        return { name: roomRoutes.list.name, query: { identifier: term } };
    }

    function buildingList(term: string): RouteLocationRaw {
        return { name: buildingRoutes.list.name, query: { name: term } };
    }

    function room(room: BasicRoom): RouteLocationRaw {
        const link = roomLink(room.id);
        if (link) return link;
        return roomList(room.identifier);
    }

    function building(building: Building): RouteLocationRaw {
        if (hasPermission(Permission.BuildingView)) {
            return { name: buildingRoutes.view.name, params: { buildingId: building.id } };
        }
        return buildingList(building.name);
    }

    return { room, building, roomList, buildingList };
}
