import type { RouteRecordRaw } from "vue-router";

export const dashboardRoutes = {
    dashboard: {
        path: "/dashboard",
        component: () => import("@/features/dashboard/views/DashboardView.vue"),
        name: "dashboard.view",
        meta: { requiresAuth: true },
    },
} as const satisfies Record<string, RouteRecordRaw>;
