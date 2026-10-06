import { useApiCall } from "@/composables/useApiCall";
import { ref } from "vue";
import type { EquipmentPageState } from "../types";
import type { Pager } from "@/features/pager/types";
import apiClient from "@/api/client";

export function useEquipmentList() {
    const { call, isLoading } = useApiCall();
    const pagedEquipment = ref<EquipmentPageState>({
        value: [],
        page: 1,
        totalPages: 1,
    });

    async function fetchEquipment(
        filterValues: Record<string, string | undefined> = {},
        pager: Pager = { page: 1, pageSize: 25 },
    ) {
        const response = await call(() =>
            apiClient.getEquipment({
                queries: { Page: pager.page, PageSize: pager.pageSize, ...filterValues },
            }),
        );
        if (response.success) {
            pagedEquipment.value = {
                value: response.data.value ?? [],
                page: response.data.page ?? 1,
                totalPages: response.data.totalPages ?? 1,
            };
        }
    }

    return { isLoading, pagedEquipment, fetchEquipment };
}
