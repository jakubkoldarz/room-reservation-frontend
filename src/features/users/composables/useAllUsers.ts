import { onMounted, ref, shallowRef } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { User } from "../types";

const MAX_PAGE_SIZE = 100;

export function useAllUsers() {
    const users = shallowRef<readonly User[]>([]);
    const isLoading = ref(false);
    const { hasPermission } = usePermissions();
    const toasts = useToastsStore();

    onMounted(async () => {
        if (!hasPermission(Permission.UserList)) return;

        isLoading.value = true;
        const result = await apiCall(() =>
            apiClient.getUsers({ queries: { PageSize: MAX_PAGE_SIZE } }),
        );
        isLoading.value = false;

        if (result.ok) users.value = result.data.items;
        else
            toasts.pushError({
                title: "Failed to load users",
                message: apiErrorMessage(result.error),
            });
    });

    return { users, isLoading };
}
