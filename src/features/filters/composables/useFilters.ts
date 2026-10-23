import { watch, type Ref } from "vue";
import { defineFilters, type Filter, type FilterValues } from "../types";
import { ref } from "vue";

export interface useFiltersReturn<T extends readonly Filter[]> {
    filters: T;
    values: Ref<FilterValues<T>>;
}

export function useFilters<const T extends readonly Filter[]>(filters: T): useFiltersReturn<T> {
    const defined = defineFilters(filters);
    const values = ref<FilterValues<T>>({});

    watch(values, (next) => console.log(next));

    return { filters: defined, values };
}
