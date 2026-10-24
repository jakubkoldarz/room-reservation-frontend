<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from "vue";
import { InboxIcon } from "@heroicons/vue/24/solid";
import Skeleton from "@/features/shared/Skeleton.vue";
import type { Column } from "../types";

const {
    columns,
    items,
    rowKey,
    isLoading = false,
    skeletonRows = 5,
} = defineProps<{
    columns: readonly Column[];
    items: readonly T[];
    rowKey: keyof T & string;
    isLoading?: boolean;
    skeletonRows?: number;
}>();

defineSlots<{
    [K in `cell-${string}`]: (props: { row: T }) => unknown;
}>();

const showRows = computed(() => !isLoading && items.length > 0);
const dataColumns = computed(() => columns.filter((col) => col.label));
const actionColumns = computed(() => columns.filter((col) => !col.label));

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
    <div class="@container">
        <div class="hidden overflow-x-auto @3xl:block">
            <table class="w-full table-fixed">
                <colgroup>
                    <col
                        v-for="col in columns"
                        :key="col.key"
                        :style="col.width ? `width: ${col.width}px` : 'min-width: 200px'"
                    />
                </colgroup>

                <thead>
                    <tr class="border-border bg-background border-b">
                        <th
                            v-for="col in columns"
                            :key="col.key"
                            class="px-4 py-2 text-sm font-medium"
                            :class="alignClass(col.align)"
                        >
                            {{ col.label }}
                        </th>
                    </tr>
                </thead>

                <tbody v-if="showRows" class="divide-border divide-y">
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

        <ul v-if="showRows" class="divide-border divide-y @3xl:hidden">
            <li v-for="item in items" :key="item[rowKey]" class="flex flex-col gap-2 p-4">
                <div
                    v-for="col in dataColumns"
                    :key="col.key"
                    class="flex items-start justify-between gap-4 text-sm"
                >
                    <span class="text-text-muted shrink-0">{{ col.label }}</span>
                    <div class="min-w-0 text-right wrap-break-word">
                        <slot :name="`cell-${col.key}`" :row="item" />
                    </div>
                </div>

                <div v-if="actionColumns.length > 0" class="flex justify-end gap-2 pt-1">
                    <template v-for="col in actionColumns" :key="col.key">
                        <slot :name="`cell-${col.key}`" :row="item" />
                    </template>
                </div>
            </li>
        </ul>

        <div v-if="isLoading" class="flex flex-col gap-4 p-4">
            <Skeleton v-for="i in skeletonRows" :key="i" class="w-full" />
        </div>

        <div v-else-if="items.length === 0" class="flex flex-col items-center gap-2 px-4 py-12">
            <InboxIcon class="text-text-muted size-24 opacity-25" />
            <span class="text-text-muted text-sm">No data available</span>
        </div>
    </div>
</template>
