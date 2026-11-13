import type { Column, ConditionalColumn } from "@/features/table/types";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export function useVisibleColumns(columns: MaybeRefOrGetter<ConditionalColumn[]>) {
    return computed(() => {
        const visibleColumns: Column[] = [];
        for (const column of toValue(columns)) {
            if (column.visible !== false) visibleColumns.push(column);
        }
        return visibleColumns;
    });
}
