<script setup lang="ts" generic="const K extends string">
import { shallowRef, watch, type ShallowRef } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import BaseInput from "@/features/shared/BaseInput.vue";
import ComboBox from "@/features/shared/ComboBox.vue";
import type { Filter, FilterValues } from "../types";

const {
    filters,
    values,
    debounce = 300,
} = defineProps<{
    filters: readonly Filter<K>[];
    values: FilterValues<K>;
    debounce?: number;
}>();

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
            if (filter.type === "text" && value !== (values[filter.key] ?? ""))
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
</script>

<template>
    <div class="flex w-full flex-col gap-2 @sm:w-auto @sm:flex-row">
        <div v-for="filter in filters" :key="filter.key" class="w-full @sm:w-56">
            <BaseInput
                v-if="filter.type === 'text'"
                type="text"
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
                has-icon
                :model-value="draft[filter.key] ?? ''"
                @update:model-value="(value) => onSelect(filter.key, value)"
            >
                <template #icon> <component :is="filter.icon ?? MagnifyingGlassIcon" /> </template>
            </ComboBox>
        </div>
    </div>
</template>
