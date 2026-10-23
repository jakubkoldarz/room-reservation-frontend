import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import type { ApiError } from "@/api/errors";
import type { Building } from "../types";

const ASIDE_PAGE_SIZE = 4;

export const useBuildingsStore = defineStore("buildings", () => {
    const buildings = shallowRef<readonly Building[]>([]);
    const totalCount = ref(0);
    const queryParam = ref("");
    const isLoading = ref(false);
    const isLoaded = ref(false);
    const error = shallowRef<ApiError | null>(null);
    let inFlight: AbortController | null = null;

    async function fetchBuildings(): Promise<void> {
        inFlight?.abort();
        const controller = new AbortController();
        inFlight = controller;
        isLoading.value = true;

        const result = await apiCall(() =>
            apiClient.getBuildings({
                queries: { Name: queryParam.value.trim() || undefined, PageSize: ASIDE_PAGE_SIZE },
                signal: controller.signal,
            }),
        );
        if (inFlight !== controller) return;

        inFlight = null;
        isLoading.value = false;
        if (result.ok) {
            buildings.value = result.data.items;
            totalCount.value = result.data.totalCount;
            isLoaded.value = true;
            error.value = null;
        } else {
            error.value = result.error;
        }
    }

    async function ensureLoaded(): Promise<void> {
        if (isLoaded.value || inFlight) return;
        await fetchBuildings();
    }

    return {
        buildings,
        totalCount,
        queryParam,
        isLoading,
        isLoaded,
        error,
        fetchBuildings,
        ensureLoaded,
    };
});
