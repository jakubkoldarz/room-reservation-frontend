import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const roomRoutes = {
    list: {
        path: "/rooms",
        name: "rooms.list",
        component: () => import("@/features/rooms/views/RoomList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoomList },
    },
    add: {
        path: "/rooms/new",
        name: "rooms.add",
        component: () => import("@/features/rooms/views/RoomAdd.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoomAdd },
    },
    view: {
        path: "/rooms/:roomId",
        name: "rooms.view",
        component: () => import("@/features/rooms/views/RoomView.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoomView },
    },
    edit: {
        path: "/rooms/:roomId/edit",
        name: "rooms.edit",
        component: () => import("@/features/rooms/views/RoomEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoomEdit },
    },
} as const satisfies Record<string, RouteRecordRaw>;
