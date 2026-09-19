import type { RouteRecordRaw } from "vue-router";

export const buildingRoutes = {
    list: {
        path: "/buildings",
        name: "buildings.list",
        component: () => import("@/features/buildings/views/BuildingList.vue"),
        meta: { requiresAuth: true },
    },
} as const satisfies Record<string, RouteRecordRaw>;
