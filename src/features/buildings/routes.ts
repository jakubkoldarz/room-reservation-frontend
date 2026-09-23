import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const buildingRoutes = {
    list: {
        path: "/buildings",
        name: "buildings.list",
        component: () => import("@/features/buildings/views/BuildingList.vue"),
        meta: { requiresAuth: true },
    },
    view: {
        path: "/buildings/:buildingId",
        name: "buildings.view",
        component: () => import("@/features/buildings/views/BuildingView.vue"),
        meta: { requiresAuth: true },
    },
    edit: {
        path: "/buildings/:buildingId/edit",
        name: "building.edit",
        component: () => import("@/features/buildings/views/BuildingEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingEdit },
    },
} as const satisfies Record<string, RouteRecordRaw>;
