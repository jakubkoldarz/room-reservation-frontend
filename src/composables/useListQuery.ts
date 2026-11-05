import { computed, type ComputedRef } from "vue";
import { useRoute, useRouter, type LocationQueryRaw } from "vue-router";
import { z } from "zod";

const firstValue = (v: unknown) => (Array.isArray(v) ? v[0] : v);
export const pageParam = z.preprocess(firstValue, z.coerce.number().int().min(1)).catch(1);
export const textParam = z.preprocess(firstValue, z.string()).catch("");

type FilterKey<Q> = Exclude<keyof Q & string, "page">;

export interface UseListQueryReturn<Q extends { page: number }> {
    query: ComputedRef<Q>;
    setFilter<K extends FilterKey<Q>>(key: K, value: Q[K]): Promise<void>;
    setFilters(values: Partial<Pick<Q, FilterKey<Q>>>): Promise<void>;
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
            const isDefault = value === "" || (key === "page" && value === 1);
            urlQuery[key] = isDefault ? undefined : String(value);
        }
        await router.push({ query: urlQuery });
    }

    async function setFilter<K extends FilterKey<Q>>(key: K, value: Q[K]): Promise<void> {
        await navigate({ ...query.value, [key]: value, page: 1 });
    }

    async function setFilters(values: Partial<Pick<Q, FilterKey<Q>>>): Promise<void> {
        await navigate({ ...query.value, ...values, page: 1 });
    }

    async function setPage(page: number): Promise<void> {
        await navigate({ ...query.value, page });
    }

    async function clampPage(totalPages: number): Promise<void> {
        if (totalPages > 0 && query.value.page > totalPages) await setPage(totalPages);
    }

    return { query, setFilter, setFilters, setPage, clampPage };
}
