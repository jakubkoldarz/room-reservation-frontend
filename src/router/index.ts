import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import { authRoutes } from "@/features/auth/routes";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
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
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;

router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return { name: authRoutes.login.name };
    }
    if (to.meta.requiresGuest && authStore.isAuthenticated) {
        return { name: dashboardRoutes.dashboard.name };
    }
});

async function handleIndexRouting() {
    const { call } = useApiCall();
    const response = await call(() => apiClient.getAuthme());
    const authStore = useAuthStore();
    if (response.success) {
        authStore.setUser(response.data);
        router.push({ name: dashboardRoutes.dashboard.name });
    } else {
        router.push({ name: authRoutes.login.name });
    }
}
