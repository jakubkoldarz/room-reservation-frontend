import { computed, ref, toValue, type MaybeRefOrGetter } from "vue";
import type { Filter, FilterValues } from "../types";

export function useMoreFilters<K extends string>(
    filters: MaybeRefOrGetter<readonly Filter<K>[]>,
    values: MaybeRefOrGetter<FilterValues<K>>,
    setFilters: (values: Partial<Record<K, string>>) => Promise<void>,
) {
    const activeCount = computed(
        () =>
            toValue(filters).filter((filter) => (toValue(values)[filter.key] ?? "") !== "").length,
    );
    const isOpen = ref(activeCount.value > 0);

    function clear(): Promise<void> {
        const cleared: Partial<Record<K, string>> = {};
        for (const filter of toValue(filters)) cleared[filter.key] = "";
        return setFilters(cleared);
    }

    return { activeCount, isOpen, clear };
}
