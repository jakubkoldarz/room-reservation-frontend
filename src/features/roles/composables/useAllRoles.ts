import { onMounted, ref, shallowRef } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { Role } from "../types";

const MAX_PAGE_SIZE = 100;

export function useAllRoles() {
    const roles = shallowRef<readonly Role[]>([]);
    const isLoading = ref(false);
    const { hasPermission } = usePermissions();
    const toasts = useToastsStore();

    onMounted(async () => {
        if (!hasPermission(Permission.RoleList)) return;

        isLoading.value = true;
        const result = await apiCall(() =>
            apiClient.getRoles({ queries: { PageSize: MAX_PAGE_SIZE } }),
        );
        isLoading.value = false;

        if (result.ok) {
            roles.value = result.data.items;
        } else {
            toasts.pushError({
                title: "Failed to load roles",
                message: apiErrorMessage(result.error),
            });
        }
    });

    return { roles, isLoading };
}
