import { onMounted, ref, shallowRef } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { RoomListItem } from "../types";

const MAX_PAGE_SIZE = 100;

export function useAllRooms() {
    const rooms = shallowRef<readonly RoomListItem[]>([]);
    const isLoading = ref(false);
    const { hasPermission } = usePermissions();
    const toasts = useToastsStore();

    onMounted(async () => {
        if (!hasPermission(Permission.RoomList)) return;

        isLoading.value = true;
        const result = await apiCall(() =>
            apiClient.getRooms({ queries: { PageSize: MAX_PAGE_SIZE } }),
        );
        isLoading.value = false;

        if (result.ok) rooms.value = result.data.items;
        else
            toasts.pushError({
                title: "Failed to load rooms",
                message: apiErrorMessage(result.error),
            });
    });

    return { rooms, isLoading };
}
