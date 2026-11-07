import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const eventRoutes = {
    list: {
        path: "/events",
        name: "events.list",
        component: () => import("@/features/events/views/EventList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EventList },
    },
} as const satisfies Record<string, RouteRecordRaw>;
