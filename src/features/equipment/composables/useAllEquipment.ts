import { onMounted, ref, shallowRef } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { Equipment } from "../types";

const MAX_PAGE_SIZE = 100;

export function useAllEquipment() {
    const equipment = shallowRef<readonly Equipment[]>([]);
    const isLoading = ref(false);
    const { hasPermission } = usePermissions();
    const toasts = useToastsStore();

    onMounted(async () => {
        if (!hasPermission(Permission.EquipmentList)) return;

        isLoading.value = true;
        const result = await apiCall(() =>
            apiClient.getEquipment({ queries: { PageSize: MAX_PAGE_SIZE } }),
        );
        isLoading.value = false;

        if (result.ok) equipment.value = result.data.items;
        else
            toasts.pushError({
                title: "Failed to load equipment",
                message: apiErrorMessage(result.error),
            });
    });

    return { equipment, isLoading };
}
