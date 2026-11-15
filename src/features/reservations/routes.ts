import type { RouteRecordRaw } from "vue-router";
import { Permission } from "../auth/constants/permissions";
import { UUID_PARAM } from "@/router/uuidParam";

export const reservationRoutes = {
    list: {
        path: "/reservations",
        name: "reservations.list",
        component: () => import("@/features/reservations/views/ReservationList.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.ReservationList },
    },
    edit: {
        path: `/reservations/:reservationId${UUID_PARAM}/edit`,
        name: "reservations.edit",
        component: () => import("@/features/reservations/views/ReservationEdit.vue"),
        meta: { requiresAuth: true, requiredPermission: Permission.ReservationView },
    },
} as const satisfies Record<string, RouteRecordRaw>;
