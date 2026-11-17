import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";
import { UUID_PARAM } from "@/router/uuidParam";

export const equipmentRoutes = {
    list: {
        path: "/equipment",
        name: "equipment.list",
        component: () => import("@/features/equipment/views/EquipmentList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EquipmentList },
    },
    add: {
        path: "/equipment/new",
        name: "equipment.add",
        component: () => import("@/features/equipment/views/EquipmentAdd.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EquipmentAdd },
    },
    edit: {
        path: `/equipment/:equipmentId${UUID_PARAM}/edit`,
        name: "equipment.edit",
        component: () => import("@/features/equipment/views/EquipmentEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EquipmentEdit },
    },
} as const satisfies Record<string, RouteRecordRaw>;
