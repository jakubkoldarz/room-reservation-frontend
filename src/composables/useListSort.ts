import { computed, toValue, type MaybeRefOrGetter } from "vue";
import type { Column, SortState } from "@/features/table/types";
import { formatSort, isSameSort, nextSort, parseSort, sortKeys } from "@/features/table/utils/sort";

export function useListSort(
    sortParam: MaybeRefOrGetter<string>,
    setSortParam: (value: string) => unknown,
    columns: MaybeRefOrGetter<readonly Column[]>,
    defaultSort: MaybeRefOrGetter<SortState>,
) {
    const sort = computed(
        () => parseSort(toValue(sortParam), sortKeys(toValue(columns))) ?? toValue(defaultSort),
    );

    function toggleSort(by: string): void {
        const next = nextSort(sort.value, by);
        void setSortParam(isSameSort(next, toValue(defaultSort)) ? "" : formatSort(next));
    }

    return { sort, toggleSort };
}
