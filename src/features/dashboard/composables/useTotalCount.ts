import { onMounted, shallowRef } from "vue";
import { apiCall } from "@/api/apiCall";
import type { Page } from "@/api/types";

export function useTotalCount(isEnabled: boolean, fetchPage: () => Promise<Page<unknown>>) {
    const count = shallowRef<number | null>(null);
    const isLoading = shallowRef(isEnabled);

    onMounted(async () => {
        if (!isEnabled) return;
        const result = await apiCall(fetchPage);
        isLoading.value = false;
        if (result.ok) count.value = result.data.totalCount;
    });

    return { count, isLoading };
}
