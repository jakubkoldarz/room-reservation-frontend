<script setup lang="ts">
import { computed, nextTick, ref, useId, useTemplateRef, watch } from "vue";
import { CheckIcon, ChevronDownIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import type { SelectOption } from "./types";

defineOptions({ inheritAttrs: false });

defineSlots<{
    icon?(): unknown;
}>();

const {
    options,
    label,
    floatingLabel = false,
    placeholder,
    errorMessage,
    hasIcon = false,
    noResultsText = "No results",
} = defineProps<{
    options: readonly SelectOption[];
    label?: string;
    floatingLabel?: boolean;
    placeholder?: string;
    errorMessage?: string;
    hasIcon?: boolean;
    noResultsText?: string;
}>();

const model = defineModel<string[]>({ default: () => [] });

const inputId = useId();
const listboxId = `${inputId}-listbox`;
const errorId = `${inputId}-error`;
const input = useTemplateRef("input");

const isOpen = ref(false);
const filterText = ref("");
const highlighted = ref(-1);

const selectedSet = computed(() => new Set(model.value));

const summary = computed(() =>
    options
        .filter((option) => selectedSet.value.has(option.value))
        .map((option) => option.label)
        .join(", "),
);

const text = computed(() => (isOpen.value ? filterText.value : summary.value));

const filtered = computed(() => {
    const needle = filterText.value.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
});

const activeDescendant = computed(() =>
    isOpen.value && highlighted.value >= 0 ? optionId(highlighted.value) : undefined,
);

watch(highlighted, async (index) => {
    if (index < 0) return;
    await nextTick();
    document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" });
});

function optionId(index: number): string {
    return `${inputId}-option-${index}`;
}

function open(): void {
    if (isOpen.value) return;
    isOpen.value = true;
    filterText.value = "";
    highlighted.value = filtered.value.length > 0 ? 0 : -1;
}

function close(): void {
    isOpen.value = false;
    filterText.value = "";
    highlighted.value = -1;
}

function toggle(option: SelectOption): void {
    model.value = selectedSet.value.has(option.value)
        ? model.value.filter((value) => value !== option.value)
        : [...model.value, option.value];
}

function clear(): void {
    model.value = [];
    close();
    input.value?.focus();
}

function onInput(event: Event): void {
    if (!(event.target instanceof HTMLInputElement)) return;
    open();
    filterText.value = event.target.value;
    highlighted.value = filtered.value.length > 0 ? 0 : -1;
}

function move(step: number): void {
    if (!isOpen.value) return open();
    const count = filtered.value.length;
    if (count === 0) return;
    highlighted.value = (highlighted.value + step + count) % count;
}

function onEnter(): void {
    const option = filtered.value[highlighted.value];
    if (isOpen.value && option) toggle(option);
}

function onEscape(): void {
    if (isOpen.value) close();
    else if (model.value.length > 0) clear();
}
</script>

<template>
    <div class="group flex flex-col gap-1">
        <label v-if="!floatingLabel && label" :for="inputId" class="text-sm font-semibold">
            {{ label }}
        </label>
        <div class="relative">
            <div
                v-if="hasIcon"
                class="text-border group-focus-within:text-primary pointer-events-none absolute top-1/2 left-2 size-5 -translate-y-1/2"
            >
                <slot name="icon" />
            </div>
            <input
                :id="inputId"
                ref="input"
                v-bind="$attrs"
                :value="text"
                type="text"
                role="combobox"
                autocomplete="off"
                spellcheck="false"
                :placeholder="floatingLabel ? ' ' : isOpen ? 'Search...' : (placeholder ?? ' ')"
                aria-autocomplete="list"
                aria-multiselectable="true"
                :aria-expanded="isOpen"
                :aria-controls="listboxId"
                :aria-activedescendant="activeDescendant"
                :aria-invalid="!!errorMessage"
                :aria-describedby="errorMessage ? errorId : undefined"
                class="peer text-text focus-visible:ring-primary w-full truncate rounded border py-1 pr-20 outline-none focus-visible:ring-2"
                :class="[
                    errorMessage ? 'border-danger' : 'border-border',
                    hasIcon ? 'pl-8' : 'pl-2',
                ]"
                @focus="open"
                @blur="close"
                @input="onInput"
                @keydown.down.prevent="move(1)"
                @keydown.up.prevent="move(-1)"
                @keydown.enter.prevent="onEnter"
                @keydown.esc.prevent="onEscape"
            />

            <label
                v-if="floatingLabel && label"
                :for="inputId"
                class="text-text-muted bg-surface pointer-events-none absolute top-0 -translate-y-1/2 px-1 text-xs font-medium transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:px-0 peer-placeholder-shown:text-sm"
                :class="hasIcon ? 'left-7 peer-placeholder-shown:left-8' : 'left-2'"
            >
                {{ label }}
            </label>

            <div class="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
                <span
                    v-if="model.length > 0"
                    class="bg-primary/10 text-primary rounded px-1.5 text-xs font-bold"
                >
                    {{ model.length }}
                </span>
                <button
                    v-if="model.length > 0"
                    type="button"
                    aria-label="Clear selection"
                    tabindex="-1"
                    class="text-text-muted hover:text-primary size-4 cursor-pointer"
                    @mousedown.prevent
                    @click="clear"
                >
                    <XMarkIcon />
                </button>
                <ChevronDownIcon
                    class="text-border group-focus-within:text-primary pointer-events-none size-5 transition-transform"
                    :class="{ 'rotate-180': isOpen }"
                />
            </div>

            <ul
                v-show="isOpen"
                :id="listboxId"
                role="listbox"
                aria-multiselectable="true"
                :aria-label="label"
                class="border-border bg-surface absolute top-full z-30 mt-1 max-h-60 w-full overflow-y-auto rounded border py-1 shadow"
            >
                <li
                    v-for="(option, index) in filtered"
                    :id="optionId(index)"
                    :key="option.value"
                    role="option"
                    :aria-selected="selectedSet.has(option.value)"
                    class="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm"
                    :class="[
                        index === highlighted ? 'bg-primary/10' : '',
                        selectedSet.has(option.value) ? 'text-primary font-semibold' : 'text-text',
                    ]"
                    :title="option.label"
                    @mousedown.prevent
                    @mouseenter="highlighted = index"
                    @click="toggle(option)"
                >
                    <span
                        class="flex size-4 shrink-0 items-center justify-center rounded border"
                        :class="
                            selectedSet.has(option.value)
                                ? 'border-primary bg-primary text-surface'
                                : 'border-border'
                        "
                    >
                        <CheckIcon v-if="selectedSet.has(option.value)" class="size-3" />
                    </span>
                    <span class="min-w-0 truncate">{{ option.label }}</span>
                </li>
                <li v-if="filtered.length === 0" class="text-text-muted px-2 py-1 text-sm">
                    {{ noResultsText }}
                </li>
            </ul>
        </div>

        <p v-if="errorMessage" :id="errorId" class="text-danger text-sm">
            {{ errorMessage }}
        </p>
    </div>
</template>
