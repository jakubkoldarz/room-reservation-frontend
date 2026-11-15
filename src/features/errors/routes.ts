import type { RouteRecordRaw } from "vue-router";

export const errorRoutes = {
    notFound: {
        path: "/:pathMatch(.*)*",
        name: "errors.notFound",
        component: () => import("@/features/errors/views/NotFoundView.vue"),
        meta: { requiresAuth: true },
    },
} as const satisfies Record<string, RouteRecordRaw>;
