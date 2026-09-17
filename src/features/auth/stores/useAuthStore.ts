import apiClient from "@/api/client";
import { defineStore } from "pinia";

type UserDetails = Awaited<ReturnType<typeof apiClient.getAuthme>>;

export const useAuthStore = defineStore("auth", {
    state: () => ({
        jwtToken: null as string | null,
        user: null as UserDetails | null,
    }),

    persist: {
        pick: ["jwtToken"],
    },

    getters: {
        isAuthenticated: (state) => state.jwtToken !== null,
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

        async register(email: string, password: string) {
            const result = await apiClient.postAuthregister({ email, password });
            return result;
        },

        async refreshToken() {
            const result = await apiClient.postAuthrefresh(undefined);
            if (result.jwtToken) this.jwtToken = result.jwtToken;
        },
    },
});
