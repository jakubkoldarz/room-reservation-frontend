import type { RouteRecordRaw } from "vue-router";

export const authRoutes = {
    login: {
        path: "/login",
        name: "auth.login",
        component: () => import("@/features/auth/views/LoginView.vue"),
        meta: { requiresGuest: true },
    },
    register: {
        path: "/register",
        name: "auth.register",
        component: () => import("@/features/auth/views/RegisterView.vue"),
        meta: { requiresGuest: true },
    },
    verification: {
        path: "/verification/:verificationId",
        name: "auth.verification",
        component: () => import("@/features/auth/views/VerificationView.vue"),
        meta: { requiresGuest: true },
    },
} as const satisfies Record<string, RouteRecordRaw>;
