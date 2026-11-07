import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const eventRoutes = {
    list: {
        path: "/events",
        name: "events.list",
        component: () => import("@/features/events/views/EventList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EventList },
    },
    add: {
        path: "/events/new",
        name: "events.add",
        component: () => import("@/features/events/views/EventAdd.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EventAdd },
    },
    edit: {
        path: "/events/:eventId/edit",
        name: "events.edit",
        component: () => import("@/features/events/views/EventEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EventEdit },
    },
} as const satisfies Record<string, RouteRecordRaw>;
