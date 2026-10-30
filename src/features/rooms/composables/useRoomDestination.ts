import type { RouteLocationRaw } from "vue-router";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { roomRoutes } from "../routes";

export function useRoomDestination() {
    const { hasPermission } = usePermissions();

    function roomLink(roomId: string): RouteLocationRaw | null {
        if (hasPermission(Permission.RoomView)) {
            return { name: roomRoutes.view.name, params: { roomId } };
        }
        if (hasPermission(Permission.RoomEdit)) {
            return { name: roomRoutes.edit.name, params: { roomId } };
        }
        return null;
    }

    function afterSave(roomId: string): RouteLocationRaw {
        return hasPermission(Permission.RoomView)
            ? { name: roomRoutes.view.name, params: { roomId } }
            : { name: roomRoutes.list.name };
    }

    return { roomLink, afterSave };
}
