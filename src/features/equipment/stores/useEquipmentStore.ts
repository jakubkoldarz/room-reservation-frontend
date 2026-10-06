import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import { defineStore } from "pinia";
import type { Equipment } from "../types";

export const useEquipmentStore = defineStore("equipment", {
    state: () => ({
        equipment: [] as Equipment[],
        totalCount: 0,
        isLoading: false,
        isLoaded: false,
    }),
    actions: {
        async refetch() {
            this.isLoading = true;
            const { call } = useApiCall();
            const response = await call(() => apiClient.getEquipment());
            if (response.success && response.data.value) {
                this.equipment = response.data.value;
                this.totalCount = response.data.totalCount ?? 0;
            } else {
                this.equipment = [];
                this.totalCount = 0;
            }
            this.isLoading = false;
            this.isLoaded = true;
        },

        async ensureLoaded() {
            if (this.isLoaded || this.isLoading) return;
            await this.refetch();
        },
    },
});
