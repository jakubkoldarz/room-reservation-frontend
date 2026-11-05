import type { RouteRecordRaw } from "vue-router";

export const profileRoutes = {
    view: {
        path: "/profile",
        name: "profile.view",
        component: () => import("@/features/profile/views/ProfileView.vue"),
        meta: { requiresAuth: true },
    },
} as const satisfies Record<string, RouteRecordRaw>;
