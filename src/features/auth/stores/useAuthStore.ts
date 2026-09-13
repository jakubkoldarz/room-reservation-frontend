import apiClient from "@/api/client";
import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        jwtToken: null as string | null,
    }),

    getters: {
        isAuthenticated: (state) => state.jwtToken !== null,
    },

    actions: {
        async login(email: string, password: string) {
            const result = await apiClient.postAuthlogin({ email, password });
            return result;
        },

        async refreshToken() {
            const result = await apiClient.postAuthrefresh(undefined);
            this.jwtToken = result.jwtToken;
        },
    },
});
