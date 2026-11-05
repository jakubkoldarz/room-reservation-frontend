import { defineStore } from "pinia";
import { ref, shallowRef } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import type { ApiError } from "@/api/errors";
import type { RoomListItem } from "../types";

const ASIDE_PAGE_SIZE = 4;

export const useRoomsStore = defineStore("rooms", () => {
    const rooms = shallowRef<readonly RoomListItem[]>([]);
    const totalCount = ref(0);
    const queryParam = ref("");
    const isLoading = ref(false);
    const isLoaded = ref(false);
    const error = shallowRef<ApiError | null>(null);
    let inFlight: AbortController | null = null;

    async function fetchRooms(): Promise<void> {
        inFlight?.abort();
        const controller = new AbortController();
        inFlight = controller;
        isLoading.value = true;

        const result = await apiCall(() =>
            apiClient.getRooms({
                queries: {
                    Identifier: queryParam.value.trim() || undefined,
                    PageSize: ASIDE_PAGE_SIZE,
                },
                signal: controller.signal,
            }),
        );
        if (inFlight !== controller) return;

        inFlight = null;
        isLoading.value = false;
        if (result.ok) {
            rooms.value = result.data.items;
            totalCount.value = result.data.totalCount;
            isLoaded.value = true;
            error.value = null;
        } else {
            error.value = result.error;
        }
    }

    async function ensureLoaded(): Promise<void> {
        if (isLoaded.value || inFlight) return;
        await fetchRooms();
    }

    return {
        rooms,
        totalCount,
        queryParam,
        isLoading,
        isLoaded,
        error,
        fetchRooms,
        ensureLoaded,
    };
});
