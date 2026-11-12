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
    let inFlight: AbortController | null = null;

    function clearResults(): void {
        inFlight?.abort();
        inFlight = null;
        rooms.value = null;
        buildings.value = null;
        error.value = null;
        isSearching.value = false;
    }

    async function search(text: string): Promise<void> {
        inFlight?.abort();
        const controller = new AbortController();
        inFlight = controller;

        const [roomResult, buildingResult] = await Promise.all([
            canSearchRooms
                ? apiCall(() =>
                      apiClient.getRooms({
                          queries: { Identifier: text, PageSize: ROOM_LIMIT },
                          signal: controller.signal,
                      }),
                  )
                : null,
            canSearchBuildings
                ? apiCall(() =>
                      apiClient.getBuildings({
                          queries: { Name: text, PageSize: BUILDING_LIMIT },
                          signal: controller.signal,
                      }),
                  )
                : null,
        ]);
        if (inFlight !== controller) return;

        inFlight = null;
        isSearching.value = false;
        rooms.value = roomResult?.ok ? roomResult.data : null;
        buildings.value = buildingResult?.ok ? buildingResult.data : null;

        const failure = [roomResult, buildingResult].find((result) => result && !result.ok);
        error.value = failure && !failure.ok ? apiErrorMessage(failure.error) : null;
    }

    watch(term, (text) => {
        if (text) isSearching.value = true;
        else clearResults();
    });

    watchDebounced(
        term,
        (text) => {
            if (text) void search(text);
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
