import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import { defineStore } from "pinia";
import type { Building } from "../types";

export const useBuildingsStore = defineStore("buildings", {
    state: () => ({
        buildings: [] as Building[],
        queryParam: "",
        totalCount: 0 as undefined | number,
        isLoaded: false,
        isLoading: false,
    }),

    actions: {
        async ensureLoaded() {
            if (this.isLoaded || this.isLoading) return;
            await this.fetchBuildings();
        },

        async fetchBuildings() {
            this.isLoading = true;
            const { call } = useApiCall();
            const result = await call(() =>
                apiClient.getBuildings({ queries: { Name: this.queryParam, PageSize: 4 } }),
            );
            if (result.success && result.data?.value) {
                this.buildings = result.data.value;

                if (!this.isLoaded) {
                    this.totalCount = result.data.totalCount;
                }
                this.isLoaded = true;
            }
            this.isLoading = false;
        },
    },
});
