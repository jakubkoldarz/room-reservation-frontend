import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";

export const reservationRoutes = {
    list: {
        path: "/reservations",
        name: "reservations.list",
        component: () => import("@/features/reservations/views/ReservationList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.ReservationList },
    },
} as const satisfies Record<string, RouteRecordRaw>;
