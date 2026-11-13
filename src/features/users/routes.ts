import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const userRoutes = {
    list: {
        path: "/users",
        name: "users.list",
        component: () => import("@/features/users/views/UserList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.UserList },
    },
} as const satisfies Record<string, RouteRecordRaw>;
