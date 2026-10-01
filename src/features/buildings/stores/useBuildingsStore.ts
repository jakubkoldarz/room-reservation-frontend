import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import { defineStore } from "pinia";

type Building = Awaited<ReturnType<typeof apiClient.getBuildingslookup>>[number];

export const useBuildingsStore = defineStore("buildings", {
    state: () => ({
        buildings: [] as Building[],
        isLoading: false,
    }),

    actions: {
        async fetchBuildings(force = false) {
            this.isLoading = true;
            const { call } = useApiCall();
            const result = await call(() => apiClient.getBuildingslookup());
            if (result.success) {
                this.buildings = result.data;
            } else {
                this.buildings = [];
            }
            this.isLoading = false;
        },
    },
});
