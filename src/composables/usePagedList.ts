import { shallowRef, toValue, watch, type MaybeRefOrGetter, type ShallowRef } from "vue";
import { apiCall } from "@/api/apiCall";
import type { ApiError } from "@/api/errors";
import type { Page } from "@/api/types";

export interface UsePagedListReturn<T> {
    /** Ostatnia udana strona — zostaje widoczna podczas ładowania i po błędzie. */
    data: Readonly<ShallowRef<Page<T> | null>>;
    isLoading: Readonly<ShallowRef<boolean>>;
    error: Readonly<ShallowRef<ApiError | null>>;
    reload(): Promise<void>;
}

/** Pobiera stronę od razu i za każdym razem, gdy zmieni się `query`. */
export function usePagedList<T, Q>(
    fetchPage: (query: Q) => Promise<Page<T>>,
    query: MaybeRefOrGetter<Q>,
): UsePagedListReturn<T> {
    const data: ShallowRef<Page<T> | null> = shallowRef(null);
    const isLoading = shallowRef(false);
    const error: ShallowRef<ApiError | null> = shallowRef(null);
    let lastRequestId = 0;

    async function load(): Promise<void> {
        const requestId = ++lastRequestId;
        isLoading.value = true;

        const result = await apiCall(() => fetchPage(toValue(query)));
        // W międzyczasie wysłano nowsze zapytanie — ta odpowiedź jest już nieaktualna.
        if (requestId !== lastRequestId) return;

        isLoading.value = false;
        if (result.ok) {
            data.value = result.data;
            error.value = null;
        } else {
            error.value = result.error;
        }
    }

    // URL daje nowy obiekt przy każdej nawigacji, więc porównujemy treść, nie referencję.
    watch(() => JSON.stringify(toValue(query)), load, { immediate: true });

    return { data, isLoading, error, reload: load };
}
