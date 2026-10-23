import { computed, type ComputedRef } from "vue";
import { useRoute, useRouter, type LocationQueryRaw } from "vue-router";
import { z } from "zod";

const firstValue = (v: unknown) => (Array.isArray(v) ? v[0] : v);

export const pageParam = z.preprocess(firstValue, z.coerce.number().int().min(1)).catch(1);
export const textParam = z.preprocess(firstValue, z.string()).catch("");

export type FilterKey<Q> = Exclude<keyof Q & string, "page">;

export interface UseListQueryReturn<Q extends { page: number }> {
    query: ComputedRef<Q>;
    setFilter<K extends FilterKey<Q>>(key: K, value: Q[K]): Promise<void>;
    setPage(page: number): Promise<void>;
    clampPage(totalPages: number): Promise<void>;
    resetFilters(): Promise<void>;
}

function isQueryPrimitive(value: unknown): value is string | number | boolean {
    return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

export function useListQuery<Q extends { page: number }>(
    schema: z.ZodType<Q, z.ZodTypeDef, unknown>,
): UseListQueryReturn<Q> {
    const route = useRoute();
    const router = useRouter();

    const defaults = schema.parse({});
    const defaultEntries = new Map<string, unknown>(Object.entries(defaults));

    const query = computed(() => schema.parse(route.query));

    function toLocationQuery(next: Q): LocationQueryRaw {
        const result: LocationQueryRaw = { ...route.query };
        const entries: [string, unknown][] = Object.entries(next);
        for (const [key, value] of entries) {
            if (!isQueryPrimitive(value) || value === defaultEntries.get(key)) {
                delete result[key];
            } else {
                result[key] = String(value);
            }
        }
        return result;
    }

    async function navigate(next: Q, mode: "push" | "replace" = "push"): Promise<void> {
        await router[mode]({ query: toLocationQuery(next) });
    }

    return {
        query,
        setFilter: (key, value) => navigate({ ...query.value, [key]: value, page: 1 }),
        setPage: (page) => navigate({ ...query.value, page }),
        async clampPage(totalPages) {
            if (totalPages >= 1 && query.value.page > totalPages) {
                await navigate({ ...query.value, page: totalPages }, "replace");
            }
        },
        resetFilters: () => navigate(defaults),
    };
}
