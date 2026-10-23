<script setup lang="ts" generic="const K extends string">
import { shallowRef, watch, type ShallowRef } from "vue";
import { useDebounceFn } from "@vueuse/core";
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import BaseInput from "@/features/shared/BaseInput.vue";
import type { Filter, FilterValues } from "../types";

const {
    filters,
    values,
    debounce = 300,
} = defineProps<{
    filters: readonly Filter<K>[];
    /** Bieżące wartości (zwykle `query` z useListQuery) — tylko do odczytu. */
    values: FilterValues<K>;
    /** Opóźnienie dla pól tekstowych w ms. */
    debounce?: number;
}>();

const emit = defineEmits<{
    change: [key: K, value: string];
}>();

// Lokalny szkic: pole musi reagować od razu, a `change` wysyłamy dopiero po przerwie w pisaniu.
const draft: ShallowRef<FilterValues<K>> = shallowRef({ ...values });
// Wartości, które sami wysłaliśmy — ich powrót z URL nie może nadpisać tego, co użytkownik
// zdążył dopisać w trakcie nawigacji.
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
            updated[filter.key] = value; // zmiana z zewnątrz, np. przycisk „wstecz”
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

function onSelect(key: K, event: Event): void {
    if (!(event.target instanceof HTMLSelectElement)) return;
    draft.value = { ...draft.value, [key]: event.target.value };
    send(key, event.target.value);
}
</script>

<template>
    <div class="flex w-full flex-wrap gap-2">
        <div v-for="filter in filters" :key="filter.key" class="flex w-full flex-col gap-2">
            <BaseInput
                v-if="filter.type === 'text'"
                type="text"
                :label="filter.placeholder"
                floating-label
                has-icon
                :model-value="draft[filter.key] ?? ''"
                @update:model-value="(value) => onText(filter.key, value)"
            >
                <template #icon> <MagnifyingGlassIcon /> </template>
            </BaseInput>

            <select
                v-else-if="filter.type === 'select'"
                :aria-label="filter.placeholder"
                :value="draft[filter.key] ?? ''"
                class="text-text border-border bg-surface focus-visible:ring-primary w-full rounded border px-2 py-1 outline-none focus-visible:ring-2"
                @change="(event) => onSelect(filter.key, event)"
            >
                <option value="">{{ filter.placeholder }}</option>
                <option v-for="option in filter.values" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>
        </div>
    </div>
</template>
