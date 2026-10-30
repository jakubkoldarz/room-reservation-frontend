<script setup lang="ts" generic="const K extends string">
import { shallowRef, watch, type ShallowRef } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import BaseInput from "@/features/shared/BaseInput.vue";
import ComboBox from "@/features/shared/ComboBox.vue";
import MultiSelect from "@/features/shared/MultiSelect.vue";
import type { Filter, FilterValues } from "../types";

const {
    filters,
    values,
    debounce = 300,
    layout = "inline",
} = defineProps<{
    filters: readonly Filter<K>[];
    values: FilterValues<K>;
    debounce?: number;
    layout?: "inline" | "grid";
}>();

const TYPED_FILTERS: ReadonlySet<Filter["type"]> = new Set(["text", "number", "time"]);

const emit = defineEmits<{
    change: [key: K, value: string];
}>();

const draft: ShallowRef<FilterValues<K>> = shallowRef({ ...values });
const sent = new Map<K, string>();

watch(
    () => values,
    (next, prev) => {
        const updated = { ...draft.value };
        for (const filter of filters) {
            const value = next[filter.key] ?? "";
            if (value === (prev[filter.key] ?? "")) continue;
            if (sent.get(filter.key) === value) {
                sent.delete(filter.key);
                continue;
            }
            updated[filter.key] = value;
        }
        draft.value = updated;
    },
);

function send(key: K, value: string): void {
    sent.set(key, value);
    emit("change", key, value);
}

const flushText = useDebounceFn(
    () => {
        for (const filter of filters) {
            const value = draft.value[filter.key] ?? "";
            if (TYPED_FILTERS.has(filter.type) && value !== (values[filter.key] ?? ""))
                send(filter.key, value);
        }
    },
    () => debounce,
);

function onText(key: K, value: string | number | null | undefined): void {
    draft.value = { ...draft.value, [key]: String(value ?? "") };
    void flushText();
}

function onSelect(key: K, value: string): void {
    draft.value = { ...draft.value, [key]: value };
    send(key, value);
}

function toList(value: string | undefined): string[] {
    return value ? value.split(",") : [];
}
</script>

<template>
    <div
        :class="
            layout === 'grid'
                ? 'grid w-full grid-cols-1 gap-x-2 gap-y-4 @sm:grid-cols-2 @3xl:grid-cols-3'
                : 'flex w-full flex-col gap-2 @sm:w-auto @sm:flex-row'
        "
    >
        <div
            v-for="filter in filters"
            :key="filter.key"
            :class="layout === 'grid' ? 'min-w-0' : 'w-full @sm:w-56'"
        >
            <BaseInput
                v-if="TYPED_FILTERS.has(filter.type)"
                :type="filter.type"
                :label="filter.placeholder"
                floating-label
                has-icon
                :model-value="draft[filter.key] ?? ''"
                @update:model-value="(value) => onText(filter.key, value)"
            >
                <template #icon> <component :is="filter.icon ?? MagnifyingGlassIcon" /> </template>
            </BaseInput>

            <ComboBox
                v-else-if="filter.type === 'select'"
                :label="filter.placeholder"
                :options="filter.values"
                floating-label
                has-icon
                :model-value="draft[filter.key] ?? ''"
                @update:model-value="(value) => onSelect(filter.key, value)"
            >
                <template #icon> <component :is="filter.icon ?? MagnifyingGlassIcon" /> </template>
            </ComboBox>

            <MultiSelect
                v-else-if="filter.type === 'multiselect'"
                :label="filter.placeholder"
                :options="filter.values"
                floating-label
                has-icon
                :model-value="toList(draft[filter.key])"
                @update:model-value="(value) => onSelect(filter.key, value.join(','))"
            >
                <template #icon> <component :is="filter.icon ?? MagnifyingGlassIcon" /> </template>
            </MultiSelect>
        </div>
    </div>
</template>
