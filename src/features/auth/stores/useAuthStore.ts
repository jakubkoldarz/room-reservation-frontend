import { apiCall } from "@/api/apiCall";
import apiClient from "@/api/client";
import type { UserDetails } from "@/features/users/types";
import { defineStore } from "pinia";

function isTokenExpired(token: string): boolean {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const CLOCK_SKEW_MS = 5 * 60 * 1000;
    return payload.exp * 1000 < Date.now() - CLOCK_SKEW_MS;
}

let pendingRefresh: Promise<string | null> | null = null;

async function requestNewToken(): Promise<string | null> {
    const result = await apiCall(() => apiClient.postAuthrefresh(undefined));
    if (!result.ok) return null;
    if (!result.data.jwtToken) return null;
    return result.data.jwtToken;
}

export const useAuthStore = defineStore("auth", {
    state: () => ({
        jwtToken: null as string | null,
        user: null as UserDetails | null,
        isTwoFactorReminderDismissed: false,
    }),

    persist: {
        pick: ["jwtToken", "isTwoFactorReminderDismissed"],
    },

    getters: {
        isAuthenticated: (state) => state.jwtToken !== null && !isTokenExpired(state.jwtToken),
        isTokenExpired: (state) => state.jwtToken !== null && isTokenExpired(state.jwtToken),
    },

    actions: {
        async login(jwtToken: string) {
            this.jwtToken = jwtToken;
            this.isTwoFactorReminderDismissed = false;
            await this.init();
        },

        dismissTwoFactorReminder() {
            this.isTwoFactorReminderDismissed = true;
        },

        async logout() {
            this.jwtToken = null;
            this.user = null;
        },

        async setUser(user: UserDetails) {
            this.user = user;
        },

        async tryRefreshToken(): Promise<boolean> {
            if (pendingRefresh === null) {
                pendingRefresh = requestNewToken();
            }
            const newToken = await pendingRefresh;
            pendingRefresh = null;

            if (newToken === null) return false;
            this.jwtToken = newToken;
            return true;
        },

        async init() {
            if (!this.jwtToken) return this.logout();

            const response = await apiCall(() => apiClient.getAuthme());

            if (response.ok) return this.setUser(response.data);

            const refreshed = await this.tryRefreshToken();
            if (!refreshed) return this.logout();

            const retryResponse = await apiCall(() => apiClient.getAuthme());
            if (retryResponse.ok) return this.setUser(retryResponse.data);

            return this.logout();
        },
    },
});
