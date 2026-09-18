import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import { defineStore } from "pinia";

type UserDetails = Awaited<ReturnType<typeof apiClient.getAuthme>>;

function isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
}

export const useAuthStore = defineStore("auth", {
    state: () => ({
        jwtToken: null as string | null,
        user: null as UserDetails | null,
    }),

    persist: {
        pick: ["jwtToken"],
    },

    getters: {
        isAuthenticated: (state) => state.jwtToken !== null && !isTokenExpired(state.jwtToken),
        isTokenExpired: (state) => state.jwtToken !== null && isTokenExpired(state.jwtToken),
    },

    actions: {
        async login(jwtToken: string) {
            this.jwtToken = jwtToken;
        },

        async logout() {
            this.jwtToken = null;
            this.user = null;
        },

        async setUser(user: UserDetails) {
            this.user = user;
        },

        async tryRefreshToken(): Promise<boolean> {
            const { call } = useApiCall();
            const result = await call(() => apiClient.postAuthrefresh(undefined));
            console.log(result);
            if (result.success && result.data.jwtToken) {
                this.jwtToken = result.data.jwtToken;
                return true;
            } else {
                return false;
            }
        },

        async init() {
            if (!this.jwtToken) return this.logout();

            const { call } = useApiCall();
            const response = await call(() => apiClient.getAuthme());

            if (response.success) return this.setUser(response.data);

            const refreshed = await this.tryRefreshToken();
            if (!refreshed) return this.logout();

            const retryResponse = await call(() => apiClient.getAuthme());
            if (retryResponse.success) return this.setUser(retryResponse.data);

            return this.logout();
        },
    },
});
