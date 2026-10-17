import { useApiCall } from "@/composables/useApiCall";
import { ref } from "vue";
import type { BuildingsPageState } from "../types";
import apiClient from "@/api/client";
import type { Pager } from "@/features/pager/types";

export function useBuildingsList() {
    const { call, isLoading } = useApiCall();
    const pagedBuildings = ref<BuildingsPageState>({
        value: [],
        page: 1,
        totalPages: 1,
    });

    async function fetchBuildings(
        filterValues: Record<string, string | undefined> = {},
        pager: Pager = { page: 1, pageSize: 25 },
    ) {
        const response = await call(() =>
            apiClient.getBuildings({
                queries: { Page: pager.page, PageSize: pager.pageSize, ...filterValues },
            }),
        );
        if (response.success) {
            pagedBuildings.value = {
                value: response.data.value ?? [],
                page: response.data.page ?? 1,
                totalPages: response.data.totalPages ?? 1,
            };
        }
    }

    return { isLoading, pagedBuildings, fetchBuildings };
}
