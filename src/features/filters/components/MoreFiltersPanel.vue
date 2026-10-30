<script setup lang="ts" generic="const K extends string">
import type { Filter, FilterValues } from "../types";
import FiltersPanel from "./FiltersPanel.vue";

const { id, filters, values, activeCount } = defineProps<{
    id: string;
    filters: readonly Filter<K>[];
    values: FilterValues<K>;
    activeCount: number;
}>();

const emit = defineEmits<{
    change: [key: K, value: string];
    clear: [];
}>();

defineSlots<{
    hint?(): unknown;
}>();
</script>

<template>
    <div :id class="border-border bg-background/50 flex flex-col gap-3 border-b p-4">
        <FiltersPanel
            layout="grid"
            :filters
            :values
            @change="(key, value) => emit('change', key, value)"
        />
        <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="text-text-muted text-xs">
                <slot name="hint" />
            </p>
            <button
                type="button"
                class="text-primary ml-auto cursor-pointer text-sm font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
                :disabled="activeCount === 0"
                @click="emit('clear')"
            >
                Clear filters
            </button>
        </div>
    </div>
</template>
