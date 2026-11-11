<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from "vue";
import { ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from "@heroicons/vue/16/solid";
import { BarsArrowDownIcon, BarsArrowUpIcon, InboxIcon } from "@heroicons/vue/24/solid";
import ComboBox from "@/features/shared/ComboBox.vue";
import IconButton from "@/features/shared/IconButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import type { Column, SortState } from "../types";

const {
    columns,
    items,
    rowKey,
    isLoading = false,
    skeletonRows = 5,
    sort = null,
} = defineProps<{
    columns: readonly Column[];
    items: readonly T[];
    rowKey: (keyof T & string) | ((item: T) => string);
    isLoading?: boolean;
    skeletonRows?: number;
    sort?: SortState | null;
}>();

const emit = defineEmits<{
    sort: [by: string];
}>();

function keyOf(item: T): string {
    return typeof rowKey === "function" ? rowKey(item) : String(item[rowKey]);
}

defineSlots<{
    [K in `cell-${string}`]: (props: { row: T }) => unknown;
}>();

const showRows = computed(() => !isLoading && items.length > 0);
const dataColumns = computed(() => columns.filter((col) => col.label));
const actionColumns = computed(() => columns.filter((col) => !col.label));

const sortOptions = computed(() =>
    columns.flatMap((col) =>
        col.sortKey && col.label ? [{ value: col.sortKey, label: col.label }] : [],
    ),
);

function isSortedBy(col: Column): boolean {
    return !!sort && !!col.sortKey && sort.by === col.sortKey;
}

function ariaSort(col: Column) {
    if (!col.sortKey || !sort) return undefined;
    if (!isSortedBy(col)) return "none";
    return sort?.direction === "desc" ? "descending" : "ascending";
}

function sortIcon(col: Column) {
    if (!isSortedBy(col)) return ChevronUpDownIcon;
    return sort?.direction === "desc" ? ChevronDownIcon : ChevronUpIcon;
}

function onSortField(value: string): void {
    if (value && value !== sort?.by) emit("sort", value);
}

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
        <div
            v-if="sort && sortOptions.length > 0"
            class="border-border flex items-center gap-2 border-b px-4 py-2 @3xl:hidden"
        >
            <span class="text-text-muted shrink-0 text-sm">Sort by</span>
            <div class="max-w-56 min-w-0 flex-1">
                <ComboBox
                    :model-value="sort.by"
                    :options="sortOptions"
                    aria-label="Sort by"
                    class="text-sm"
                    @update:model-value="onSortField"
                />
            </div>
            <IconButton
                :aria-label="sort.direction === 'asc' ? 'Sort descending' : 'Sort ascending'"
                @click="emit('sort', sort.by)"
            >
                <BarsArrowUpIcon v-if="sort.direction === 'asc'" class="size-5" />
                <BarsArrowDownIcon v-else class="size-5" />
            </IconButton>
        </div>

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
                            :aria-sort="ariaSort(col)"
                        >
                            <button
                                v-if="col.sortKey && sort"
                                type="button"
                                class="hover:text-primary focus-visible:ring-primary -mx-1 inline-flex cursor-pointer items-center gap-1 rounded px-1 font-medium transition-colors outline-none focus-visible:ring-2"
                                :class="{ 'text-primary': isSortedBy(col) }"
                                @click="emit('sort', col.sortKey)"
                            >
                                {{ col.label }}
                                <component
                                    :is="sortIcon(col)"
                                    class="size-4 shrink-0"
                                    :class="{ 'text-text-muted/50': !isSortedBy(col) }"
                                />
                            </button>
                            <template v-else>{{ col.label }}</template>
                        </th>
                    </tr>
                </thead>

                <tbody v-if="showRows" class="divide-border divide-y">
                    <tr
                        v-for="item in items"
                        :key="keyOf(item)"
                        class="hover:bg-background transition-colors"
                    >
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
            <li v-for="item in items" :key="keyOf(item)" class="flex flex-col gap-2 p-4">
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
