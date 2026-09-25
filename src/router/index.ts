import { usePermissions } from "@/composables/usePermissions";
import { authRoutes } from "@/features/auth/routes";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { buildingRoutes } from "@/features/buildings/routes";
import { dashboardRoutes } from "@/features/dashboard/routes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        component: () => import("@/App.vue"),
        path: "/",
        name: "index",
        beforeEnter: handleIndexRouting,
    },
    ...Object.values(authRoutes),
    ...Object.values(dashboardRoutes),
    ...Object.values(buildingRoutes),
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

router.beforeEach((to) => {
    const authStore = useAuthStore();
    const { hasPermission } = usePermissions();

    console.log("1");
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        console.log("2");

        return { name: authRoutes.login.name };
    }
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        console.log("3");

        return { name: dashboardRoutes.dashboard.name };
    }

    if (to.meta.requiredPermission && !hasPermission(to.meta.requiredPermission)) {
        console.log("4");
        return { name: dashboardRoutes.dashboard.name };
    }
    console.log("5");
});

function handleIndexRouting() {
    const authStore = useAuthStore();
    return authStore.isAuthenticated ? { name: dashboardRoutes.dashboard.name } : { name: authRoutes.login.name };
}
