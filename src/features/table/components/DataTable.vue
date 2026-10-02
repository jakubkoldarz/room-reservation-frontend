<script setup lang="ts" generic="T extends Record<string, any>">
import { InboxIcon } from "@heroicons/vue/24/solid";
import type { Column, Pager } from "../types";
import Skeleton from "@/features/shared/Skeleton.vue";

const props = withDefaults(
    defineProps<{
        columns: Column[];
        items: T[];
        rowKey: keyof T & string;
        isLoading?: boolean;
        pager?: Pager;
    }>(),
    {
        columns: () => [],
        items: () => [],
        isLoading: false,
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
                    :style="col.width ? `width: ${col.width}px` : 'min-width: 200px'"
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
                <template v-if="items.length > 0 && !isLoading">
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
                </template>

                <template v-else-if="isLoading">
                    <tr v-for="i in props.pager?.pageSize ?? 5" :key="i">
                        <td :colspan="columns.length" class="p-2">
                            <Skeleton class="w-full" />
                        </td>
                    </tr>
                </template>

                <tr v-else>
                    <td :colspan="columns.length" class="px-4 w-full py-12">
                        <div class="flex flex-col items-center justify-center gap-2">
                            <InboxIcon class="size-24 opacity-25 text-text-muted" />
                            <span class="text-sm text-text-muted">No data available</span>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
