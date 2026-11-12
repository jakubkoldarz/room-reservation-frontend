import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { buildingRoutes } from "@/features/buildings/routes";
import { useRoomDestination } from "@/features/rooms/composables/useRoomDestination";
import { roomRoutes } from "@/features/rooms/routes";
import type { SearchLinks } from "../types";

export function useSearchLinks(): SearchLinks {
    const { hasPermission } = usePermissions();
    const { roomLink } = useRoomDestination();

    const links: SearchLinks = {
        room: (room) => roomLink(room.id) ?? links.roomList(room.identifier),
        building: (building) =>
            hasPermission(Permission.BuildingView)
                ? { name: buildingRoutes.view.name, params: { buildingId: building.id } }
                : links.buildingList(building.name),
        roomList: (term) => ({ name: roomRoutes.list.name, query: { identifier: term } }),
        buildingList: (term) => ({ name: buildingRoutes.list.name, query: { name: term } }),
    };

    return links;
}
