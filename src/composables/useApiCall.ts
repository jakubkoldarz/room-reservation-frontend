import type { ApiErrorResponse } from "@/types/api-error";
import type { ApiResult } from "@/types/api-result";
import { AxiosError } from "axios";
import { ref } from "vue";

export function useApiCall() {
    const isLoading = ref<boolean>();
    const error = ref<ApiErrorResponse | null>();

    async function call<T>(fn: () => Promise<T>): Promise<ApiResult<T>> {
        try {
            isLoading.value = true;
            const data = await fn();
            isLoading.value = false;
            error.value = null;

            return { success: true, data };
        } catch (err) {
            isLoading.value = false;
            if (!(err instanceof AxiosError) || !err.response) {
                error.value = {
                    message: "Unknown error occured",
                    statusCode: 500,
                    conflictingItems: null,
                } as ApiErrorResponse;
                return { success: false, error: null };
            }

            error.value = err.response.data;
            const data = err.response.data;
            return { success: false, error: data };
        }
    }

    return { call, isLoading, error };
}
