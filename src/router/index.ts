import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
    {
        path: "/login",
        name: "auth.login",
        component: () => import("@/views/LoginView.vue"),
        meta: {
            requiresGuest: true
        }
    },
    {
        path: "/register",
        name: "auth.register",
        component: () => import("@/views/RegisterView.vue"),
        meta: {
            requiresGuest: true,
        }
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to) => {
    const isAuthenticated = true;

    if(to.meta.requiresAuth && !isAuthenticated) {
        return { name: 'auth.login' }
    }

    // if(to.meta.requiresGuest && isAuthenticated) {
    //     return { name: 'dashboard' }
    // }
})

export default router;
