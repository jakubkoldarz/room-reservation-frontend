import type { ApiResult } from "@/types/api-result";
import { AxiosError } from "axios";
import { ref } from "vue";

export function useApiCall() {
    const isLoading = ref<boolean>();

    async function call<T>(fn: () => Promise<T>): Promise<ApiResult<T>> {
        try {
            isLoading.value = true;
            const data = await fn();
            isLoading.value = false;
            return { success: true, data };
        } catch (error) {
            isLoading.value = false;
            if (!(error instanceof AxiosError) || !error.response) {
                return { success: false, error: null };
            }

            const data = error.response.data;
            return { success: false, error: data };
        }
    }

    return { call, isLoading };
}
