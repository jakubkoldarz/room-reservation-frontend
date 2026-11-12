import { computed, ref, toValue, type MaybeRefOrGetter } from "vue";
import type { Filter, FilterValues } from "../types";

export function useMoreFilters<K extends string>(
    filters: MaybeRefOrGetter<readonly Filter<K>[]>,
    values: MaybeRefOrGetter<FilterValues<K>>,
    setFilters: (values: FilterValues<K>) => Promise<void>,
) {
    const activeCount = computed(() => {
        const currentValues = toValue(values);
        let count = 0;
        for (const filter of toValue(filters)) {
            const value = currentValues[filter.key];
            if (value !== undefined && value !== "") count++;
        }
        return count;
    });

    const isOpen = ref(activeCount.value > 0);

    async function clear(): Promise<void> {
        const cleared: FilterValues<K> = {};
        for (const filter of toValue(filters)) {
            cleared[filter.key] = "";
        }
        await setFilters(cleared);
    }

    return { activeCount, isOpen, clear };
}
