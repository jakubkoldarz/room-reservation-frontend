import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { authRoutes } from "../routes";
import { useAuthStore } from "../stores/useAuthStore";

export function useSignOut() {
    const authStore = useAuthStore();
    const router = useRouter();
    const isSigningOut = ref(false);

    async function signOut(): Promise<void> {
        isSigningOut.value = true;
        await apiCall(() => apiClient.postAuthlogout(undefined));
        await authStore.logout();
        isSigningOut.value = false;
        await router.push({ name: authRoutes.login.name });
    }

    return { signOut, isSigningOut };
}
