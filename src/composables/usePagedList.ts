import {
    onScopeDispose,
    shallowRef,
    toValue,
    watch,
    type MaybeRefOrGetter,
    type ShallowRef,
} from "vue";
import { apiCall } from "@/api/apiCall";
import type { ApiError } from "@/api/errors";
import type { Page } from "@/api/types";

export type PageFetcher<T, Q> = (query: Q, signal: AbortSignal) => Promise<Page<T>>;

export interface UsePagedListReturn<T> {
    data: Readonly<ShallowRef<Page<T> | null>>;
    isLoading: Readonly<ShallowRef<boolean>>;
    error: Readonly<ShallowRef<ApiError | null>>;
    reload(): Promise<void>;
}

function shallowEqual(a: object, b: object): boolean {
    const entriesA: [string, unknown][] = Object.entries(a);
    const entriesB = new Map<string, unknown>(Object.entries(b));
    return (
        entriesA.length === entriesB.size &&
        entriesA.every(([key, value]) => Object.is(value, entriesB.get(key)))
    );
}

/**
 * Pobiera stronę za każdym razem, gdy zmieni się `query`.
 * Nowe żądanie anuluje poprzednie, więc spóźniona odpowiedź nigdy nie nadpisze nowszej.
 */
export function usePagedList<T, Q extends object>(
    fetchPage: PageFetcher<T, Q>,
    query: MaybeRefOrGetter<Q>,
): UsePagedListReturn<T> {
    const data: ShallowRef<Page<T> | null> = shallowRef(null);
    const isLoading = shallowRef(false);
    const error: ShallowRef<ApiError | null> = shallowRef(null);
    let inFlight: AbortController | null = null;

    async function load(q: Q): Promise<void> {
        inFlight?.abort();
        const controller = new AbortController();
        inFlight = controller;
        isLoading.value = true;

        const result = await apiCall(() => fetchPage(q, controller.signal));
        if (inFlight !== controller) return; // w międzyczasie wysłano nowsze żądanie

        inFlight = null;
        isLoading.value = false;
        if (result.ok) {
            data.value = result.data;
            error.value = null;
        } else {
            error.value = result.error;
        }
    }

    // computed z URL daje nowy obiekt przy każdej nawigacji — pobieramy tylko, gdy zmieniła się treść.
    watch(
        () => toValue(query),
        (next, prev) => {
            if (prev === undefined || !shallowEqual(next, prev)) void load(next);
        },
        { immediate: true },
    );

    onScopeDispose(() => {
        const controller = inFlight;
        inFlight = null;
        controller?.abort();
    });

    return { data, isLoading, error, reload: () => load(toValue(query)) };
}
