import type { Column, ConditionalColumn } from "@/features/table/types";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export function useVisibleColumns(columns: MaybeRefOrGetter<ConditionalColumn[]>) {
    return computed<Column[]>(() => {
        const source = toValue(columns);
        const filtered = source.filter((c) => c.visible !== false);
        return filtered.map(({ visible, ...column }) => column);
    });
}
