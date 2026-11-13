import { computed, type ComputedRef } from "vue";
import { useRoute, useRouter, type LocationQueryRaw } from "vue-router";
import { z } from "zod";

function firstValue(value: unknown): unknown {
    if (Array.isArray(value)) return value[0];
    return value;
}

export const pageParam = z.preprocess(firstValue, z.coerce.number().int().min(1)).catch(1);
export const textParam = z.preprocess(firstValue, z.string()).catch("");

export interface UseListQueryReturn<Q extends { page: number }> {
    query: ComputedRef<Q>;
    setFilter(key: keyof Q, value: string): Promise<void>;
    setFilters(values: Partial<Q>): Promise<void>;
    setPage(page: number): Promise<void>;
    clampPage(totalPages: number): Promise<void>;
}

export function useListQuery<Q extends { page: number }>(
    schema: z.ZodType<Q, z.ZodTypeDef, unknown>,
): UseListQueryReturn<Q> {
    const route = useRoute();
    const router = useRouter();

    const query = computed(() => schema.parse(route.query));

    async function navigate(next: Q): Promise<void> {
        const urlQuery: LocationQueryRaw = { ...route.query };

        const entries: [string, unknown][] = Object.entries(next);

        for (const [key, value] of entries) {
            const isEmptyFilter = value === "";
            const isFirstPage = key === "page" && value === 1;

            if (isEmptyFilter || isFirstPage) {
                urlQuery[key] = undefined;
            } else {
                urlQuery[key] = String(value);
            }
        }

        await router.push({ query: urlQuery });
    }

    async function setFilter(key: keyof Q, value: string): Promise<void> {
        await navigate({ ...query.value, [key]: value, page: 1 });
    }

    async function setFilters(values: Partial<Q>): Promise<void> {
        await navigate({ ...query.value, ...values, page: 1 });
    }

    async function setPage(page: number): Promise<void> {
        await navigate({ ...query.value, page });
    }

    async function clampPage(totalPages: number): Promise<void> {
        const isPastLastPage = totalPages > 0 && query.value.page > totalPages;
        if (isPastLastPage) await setPage(totalPages);
    }

    return { query, setFilter, setFilters, setPage, clampPage };
}
