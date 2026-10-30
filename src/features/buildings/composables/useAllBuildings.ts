import { onMounted, ref, shallowRef } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { Building } from "../types";

const MAX_PAGE_SIZE = 100;

export function useAllBuildings() {
    const buildings = shallowRef<readonly Building[]>([]);
    const isLoading = ref(false);
    const { hasPermission } = usePermissions();
    const toasts = useToastsStore();

    onMounted(async () => {
        if (!hasPermission(Permission.BuildingList)) return;

        isLoading.value = true;
        const result = await apiCall(() =>
            apiClient.getBuildings({ queries: { PageSize: MAX_PAGE_SIZE } }),
        );
        isLoading.value = false;

        if (result.ok) buildings.value = result.data.items;
        else
            toasts.pushError({
                title: "Failed to load buildings",
                message: apiErrorMessage(result.error),
            });
    });

    return { buildings, isLoading };
}
