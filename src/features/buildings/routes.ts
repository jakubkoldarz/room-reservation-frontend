import type { RouteRecordRaw } from "vue-router";

export const buildingRoutes = {
    list: {
        path: "/buildings",
        name: "buildings.list",
        component: () => import("@/features/buildings/views/BuildingList.vue"),
        meta: { requiresAuth: true },
    },
    view: {
        path: "/buildings/:buildingId",
        name: "buildings.view",
        component: () => import("@/features/buildings/views/BuildingView.vue"),
        meta: { requiresAuth: true },
    },
} as const satisfies Record<string, RouteRecordRaw>;
