import { watchDebounced } from "@vueuse/core";
import { computed, ref, shallowRef, watch } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import type { Page } from "@/api/types";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import type { Building } from "@/features/buildings/types";
import type { RoomListItem } from "@/features/rooms/types";

const DEBOUNCE_MS = 250;
const ROOM_LIMIT = 5;
const BUILDING_LIMIT = 3;

export function useGlobalSearch() {
    const { hasPermission } = usePermissions();
    const canSearchRooms = hasPermission(Permission.RoomList);
    const canSearchBuildings = hasPermission(Permission.BuildingList);

    const query = ref("");
    const term = computed(() => query.value.trim());
    const rooms = shallowRef<Page<RoomListItem> | null>(null);
    const buildings = shallowRef<Page<Building> | null>(null);
    const isSearching = ref(false);
    const error = ref<string | null>(null);
    let currentRequest: AbortController | null = null;

    function cancelCurrentRequest(): void {
        if (currentRequest) currentRequest.abort();
        currentRequest = null;
    }

    function clearResults(): void {
        cancelCurrentRequest();
        rooms.value = null;
        buildings.value = null;
        error.value = null;
        isSearching.value = false;
    }

    async function findRooms(text: string, signal: AbortSignal) {
        if (!canSearchRooms) return null;

        const queries = { Identifier: text, PageSize: ROOM_LIMIT };
        return await apiCall(() => apiClient.getRooms({ queries, signal }));
    }

    async function findBuildings(text: string, signal: AbortSignal) {
        if (!canSearchBuildings) return null;

        const queries = { Name: text, PageSize: BUILDING_LIMIT };
        return await apiCall(() => apiClient.getBuildings({ queries, signal }));
    }

    async function search(text: string): Promise<void> {
        cancelCurrentRequest();
        const request = new AbortController();
        currentRequest = request;

        const [roomResult, buildingResult] = await Promise.all([
            findRooms(text, request.signal),
            findBuildings(text, request.signal),
        ]);

        const wasReplacedByNewerSearch = currentRequest !== request;
        if (wasReplacedByNewerSearch) return;

        currentRequest = null;
        isSearching.value = false;
        rooms.value = null;
        buildings.value = null;
        error.value = null;

        if (roomResult) {
            if (roomResult.ok) {
                rooms.value = roomResult.data;
            } else {
                error.value = apiErrorMessage(roomResult.error);
            }
        }

        if (buildingResult) {
            if (buildingResult.ok) {
                buildings.value = buildingResult.data;
            } else {
                error.value = apiErrorMessage(buildingResult.error);
            }
        }
    }

    watch(term, (text) => {
        if (text === "") {
            clearResults();
        } else {
            isSearching.value = true;
        }
    });

    watchDebounced(
        term,
        async (text) => {
            if (text !== "") await search(text);
        },
        { debounce: DEBOUNCE_MS },
    );

    return {
        query,
        term,
        rooms,
        buildings,
        isSearching,
        error,
        canSearchRooms,
        canSearchBuildings,
    };
}
