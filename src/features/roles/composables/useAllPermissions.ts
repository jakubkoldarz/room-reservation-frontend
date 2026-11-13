import { onMounted, ref, shallowRef } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { PermissionItem } from "../types";

const MAX_PAGE_SIZE = 100;

export function useAllPermissions() {
    const permissions = shallowRef<readonly PermissionItem[]>([]);
    const isLoading = ref(false);
    const { hasPermission } = usePermissions();
    const toasts = useToastsStore();

    onMounted(async () => {
        if (!hasPermission(Permission.PermissionList)) return;

        isLoading.value = true;
        const result = await apiCall(() =>
            apiClient.getPermissions({ queries: { PageSize: MAX_PAGE_SIZE } }),
        );
        isLoading.value = false;

        if (result.ok) {
            permissions.value = result.data.items;
        } else {
            toasts.pushError({
                title: "Failed to load permissions",
                message: apiErrorMessage(result.error),
            });
        }
    });

    return { permissions, isLoading };
}
