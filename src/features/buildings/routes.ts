import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";
import { UUID_PARAM } from "@/router/uuidParam";

export const buildingRoutes = {
    list: {
        path: "/buildings",
        name: "buildings.list",
        component: () => import("@/features/buildings/views/BuildingList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingList },
    },
    add: {
        path: "/buildings/new",
        name: "buildings.add",
        component: () => import("@/features/buildings/views/BuildingAdd.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingAdd },
    },
    view: {
        path: `/buildings/:buildingId${UUID_PARAM}`,
        name: "buildings.view",
        component: () => import("@/features/buildings/views/BuildingView.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingView },
    },
    edit: {
        path: `/buildings/:buildingId${UUID_PARAM}/edit`,
        name: "buildings.edit",
        component: () => import("@/features/buildings/views/BuildingEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.BuildingEdit },
    },
} as const satisfies Record<string, RouteRecordRaw>;
