import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const roomRoutes = {
    list: {
        path: "/rooms",
        name: "rooms.list",
        component: () => import("@/features/rooms/views/RoomList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoomList },
    },
} as const satisfies Record<string, RouteRecordRaw>;
