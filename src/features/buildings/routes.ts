import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const buildingRoutes = {
    list: {
        path: "/buildings",
        name: "buildings.list",
        component: () => import("@/features/buildings/views/BuildingList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingList },
    },
    add: {
        path: "/buildings/new",
        name: "building.add",
        component: () => import("@/features/buildings/views/BuildingAdd.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingAdd },
    },
    view: {
        path: "/buildings/:buildingId",
        name: "buildings.view",
        component: () => import("@/features/buildings/views/BuildingView.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingView },
    },
    edit: {
        path: "/buildings/:buildingId/edit",
        name: "building.edit",
        component: () => import("@/features/buildings/views/BuildingEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingEdit },
    },
} as const satisfies Record<string, RouteRecordRaw>;
