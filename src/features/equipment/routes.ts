import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

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
    view: {
        path: "/equipment/:equipmentId",
        name: "equipment.view",
        component: () => import("@/features/equipment/views/EquipmentView.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EquipmentView },
    },
    edit: {
        path: "/equipment/:equipmentId/edit",
        name: "equipment.edit",
        component: () => import("@/features/equipment/views/EquipmentEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.EquipmentEdit },
    },
} as const satisfies Record<string, RouteRecordRaw>;
