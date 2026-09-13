import type { RouteRecordRaw } from "vue-router";

export const authRoutes = {
    login: {
        path: "/login",
        name: "auth.login",
        component: () => import("@/views/LoginView.vue"),
        meta: { requiresGuest: true },
    },
    register: {
        path: "/register",
        name: "auth.register",
        component: () => import("@/views/RegisterView.vue"),
        meta: { requiresGuest: true },
    },
} as const satisfies Record<string, RouteRecordRaw>;
