<script setup lang="ts" generic="T extends Record<string, any>">
import type { Column } from "../types/table-column";

const props = withDefaults(
    defineProps<{
        columns: Column[];
        items: T[];
        rowKey: keyof T & string;
    }>(),
    {
        columns: () => [],
        items: () => [],
    },
);

defineSlots<{
    [K in `cell-${string}`]: (props: { row: T }) => any;
}>();

const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
} as const;
function alignClass(align?: Column["align"]) {
    return alignClasses[align ?? "left"];
}
</script>

<template>
    <div class="overflow-x-auto">
        <table class="w-full table-fixed">
            <colgroup>
                <col
                    v-for="col in columns"
                    :key="col.key"
                    :style="{ width: col.width ? `${col.width}px` : undefined }"
                />
            </colgroup>

            <thead>
                <tr class="border-b border-border">
                    <th
                        v-for="col in columns"
                        :key="col.key"
                        class="px-4 py-2 text-sm font-semibold"
                        :class="alignClass(col.align)"
                    >
                        {{ col.label }}
                    </th>
                </tr>
            </thead>

            <tbody class="divide-y divide-border">
                <tr v-for="item in items" :key="item[rowKey]">
                    <td
                        v-for="col in columns"
                        :key="col.key"
                        class="truncate px-4 py-2 text-sm"
                        :class="alignClass(col.align)"
                    >
                        <slot :name="`cell-${col.key}`" :row="item" />
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
