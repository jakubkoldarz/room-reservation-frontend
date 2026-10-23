import { shallowRef } from "vue";
import { useApiCall } from "./useApiCall";

export type Page<T> = {
    items: T[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
};

export function useList<T>(fetcher: () => Promise<Page<T>>) {
    const { call, isLoading, error } = useApiCall();
    const page = shallowRef<Page<T>>();
    let lastRequestId = 0;

    async function fetchPage() {
        const requestId = ++lastRequestId;
        const response = await call(fetcher);
        if (requestId !== lastRequestId) return;
        if (response.success) page.value = response.data;
    }

    return { page, isLoading, error, fetch: fetchPage };
}
