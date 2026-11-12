import { usePermissions } from "@/composables/usePermissions";
import { authRoutes } from "@/features/auth/routes";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { onboardingRouteName } from "@/features/auth/utils/onboarding";
import { buildingRoutes } from "@/features/buildings/routes";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { equipmentRoutes } from "@/features/equipment/routes";
import { eventRoutes } from "@/features/events/routes";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { profileRoutes } from "@/features/profile/routes";
import { reservationRoutes } from "@/features/reservations/routes";
import { roomRoutes } from "@/features/rooms/routes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    ...Object.values(authRoutes),
    {
        path: "/",
        component: AsideNavbarLayout,
        meta: { requiresAuth: true },
        children: [
            { path: "", name: "index", redirect: handleIndexRouting },
            ...Object.values(dashboardRoutes),
            ...Object.values(buildingRoutes),
            ...Object.values(equipmentRoutes),
            ...Object.values(roomRoutes),
            ...Object.values(profileRoutes),
            ...Object.values(reservationRoutes),
            ...Object.values(eventRoutes),
        ],
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

router.beforeEach((to) => {
    const authStore = useAuthStore();
    const { hasPermission } = usePermissions();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: authRoutes.login.name, query: { redirect: to.fullPath } };
    }
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        return { name: dashboardRoutes.dashboard.name };
    }

    if (to.meta.requiresAuth && authStore.user) {
        const pendingStep = onboardingRouteName(authStore.user.accountStatus);
        if (pendingStep && to.name !== pendingStep) return { name: pendingStep };
        if (!pendingStep && to.meta.onboarding) return { name: dashboardRoutes.dashboard.name };
    }

    if (to.meta.requiredPermission && !hasPermission(to.meta.requiredPermission)) {
        return { name: dashboardRoutes.dashboard.name };
    }
});

function handleIndexRouting() {
    const authStore = useAuthStore();
    return authStore.isAuthenticated
        ? { name: dashboardRoutes.dashboard.name }
        : { name: authRoutes.login.name };
}
