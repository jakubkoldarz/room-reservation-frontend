import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const roleRoutes = {
    list: {
        path: "/roles",
        name: "roles.list",
        component: () => import("@/features/roles/views/RoleList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoleList },
    },
    add: {
        path: "/roles/new",
        name: "roles.add",
        component: () => import("@/features/roles/views/RoleAdd.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoleAdd },
    },
    view: {
        path: "/roles/:roleId",
        name: "roles.view",
        component: () => import("@/features/roles/views/RoleEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoleView },
    },
    edit: {
        path: "/roles/:roleId/edit",
        name: "roles.edit",
        component: () => import("@/features/roles/views/RoleEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.RoleEdit },
    },
} as const satisfies Record<string, RouteRecordRaw>;
