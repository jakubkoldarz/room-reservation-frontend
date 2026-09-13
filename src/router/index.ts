import { authRoutes } from "@/features/auth/routes";
import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [...Object.values(authRoutes)];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const isAuthenticated = true;

    if (to.meta.requiresAuth && !isAuthenticated) {
        return { name: "auth.login" };
    }

    // if(to.meta.requiresGuest && isAuthenticated) {
    //     return { name: 'dashboard' }
    // }
});

export default router;
