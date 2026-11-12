<script setup lang="ts">
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import { computed, nextTick, ref, useId, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGlobalSearch } from "../composables/useGlobalSearch";
import { useSearchLinks } from "../composables/useSearchLinks";
import type { SearchItem } from "../types";
import { buildSearchGroups } from "../utils/searchGroups";

const route = useRoute();
const router = useRouter();
const links = useSearchLinks();
const { query, term, rooms, buildings, isSearching, error, canSearchRooms, canSearchBuildings } =
    useGlobalSearch();

const root = useTemplateRef("root");
const input = useTemplateRef("input");
const inputId = useId();
const listboxId = `${inputId}-results`;

const isOpen = ref(false);
const highlightedIndex = ref(-1);

const placeholder = computed(() => {
    if (canSearchRooms && canSearchBuildings) return "Search rooms and buildings...";
    if (canSearchRooms) return "Search rooms...";
    return "Search buildings...";
});

const groups = computed(() =>
    buildSearchGroups({
        term: term.value,
        rooms: rooms.value,
        buildings: buildings.value,
        links,
    }),
);

const options = computed(() => {
    const items: SearchItem[] = [];
    for (const group of groups.value) {
        for (const item of group.items) {
            items.push(item);
        }
    }
    return items;
});

const highlightedOption = computed(() => {
    if (highlightedIndex.value < 0) return null;
    return options.value[highlightedIndex.value] ?? null;
});

const isPanelVisible = computed(() => isOpen.value && term.value !== "");

const activeDescendant = computed(() => {
    if (!isPanelVisible.value || !highlightedOption.value) return undefined;
    return optionId(highlightedOption.value);
});

const emptyMessage = computed(() => {
    if (isSearching.value) return "Searching...";
    return `No results for “${term.value}”`;
});

watch([term, options], () => {
    highlightedIndex.value = -1;
});

watch(highlightedOption, async (item) => {
    if (!item) return;
    await nextTick();
    const element = document.getElementById(optionId(item));
    if (element) element.scrollIntoView({ block: "nearest" });
});

watch(() => route.fullPath, clear);

function optionId(item: SearchItem): string {
    return `${inputId}-option-${item.id}`;
}

function isHighlighted(item: SearchItem): boolean {
    return highlightedOption.value === item;
}

function highlight(item: SearchItem): void {
    highlightedIndex.value = options.value.indexOf(item);
}

function open(): void {
    isOpen.value = true;
}

function clear(): void {
    query.value = "";
    isOpen.value = false;
}

function focusInput(): void {
    if (input.value) input.value.focus();
}

function blurInput(): void {
    if (input.value) input.value.blur();
}

function move(step: number): void {
    isOpen.value = true;
    const count = options.value.length;
    if (count === 0) return;

    let next = highlightedIndex.value + step;
    if (next >= count) next = 0;
    if (next < 0) next = count - 1;
    highlightedIndex.value = next;
}

async function onEnter(): Promise<void> {
    if (term.value === "") return;

    let target = links.buildingList(term.value);
    if (canSearchRooms) target = links.roomList(term.value);
    if (highlightedOption.value) target = highlightedOption.value.to;

    clear();
    blurInput();
    await router.push(target);
}

function onEscape(): void {
    if (isPanelVisible.value) {
        isOpen.value = false;
    } else if (query.value !== "") {
        clear();
    } else {
        blurInput();
    }
}

function onFocusOut(event: FocusEvent): void {
    const nextFocused = event.relatedTarget;
    if (root.value && nextFocused instanceof Node && root.value.contains(nextFocused)) return;
    isOpen.value = false;
}

function clearAndFocus(): void {
    clear();
    focusInput();
}

defineExpose({ focus: focusInput, clear });
</script>

<template>
    <div ref="root" class="relative w-full max-w-175" @focusout="onFocusOut">
        <MagnifyingGlassIcon
            class="text-text-muted-secondary pointer-events-none absolute top-1/2 left-2 size-5 -translate-y-1/2"
        />
        <input
            :id="inputId"
            ref="input"
            v-model="query"
            type="text"
            role="combobox"
            autocomplete="off"
            spellcheck="false"
            aria-label="Search"
            aria-autocomplete="list"
            :aria-expanded="isPanelVisible"
            :aria-controls="listboxId"
            :aria-activedescendant="activeDescendant"
            :placeholder
            class="border-border-secondary bg-secondary-hover text-text-secondary placeholder:text-text-muted-secondary focus-visible:ring-primary w-full rounded-md border py-1 pr-2 pl-8 text-sm outline-none focus-visible:ring-2 sm:pr-8"
            @focus="open"
            @input="open"
            @keydown.down.prevent="move(1)"
            @keydown.up.prevent="move(-1)"
            @keydown.enter.prevent="onEnter"
            @keydown.esc.prevent="onEscape"
        />
        <button
            v-if="query"
            type="button"
            aria-label="Clear search"
            tabindex="-1"
            class="text-text-muted-secondary hover:text-text-secondary absolute top-1/2 right-2 hidden size-4 -translate-y-1/2 cursor-pointer sm:block"
            @mousedown.prevent
            @click="clearAndFocus"
        >
            <XMarkIcon />
        </button>

        <div
            v-if="isPanelVisible"
            :id="listboxId"
            role="listbox"
            aria-label="Search results"
            class="bg-surface border-border fixed inset-x-0 top-12 max-h-[calc(100dvh-3rem)] overflow-y-auto border-b shadow-xl sm:absolute sm:top-full sm:mt-2 sm:max-h-[min(36rem,calc(100dvh-4rem))] sm:rounded-lg sm:border"
            @mousedown.prevent
        >
            <p v-if="error" class="text-danger px-3.5 py-3 text-sm">{{ error }}</p>
            <p v-else-if="options.length === 0" class="text-text-muted px-3.5 py-3 text-sm">
                {{ emptyMessage }}
            </p>

            <div
                v-for="group in groups"
                :key="group.key"
                role="group"
                :aria-label="group.label"
                class="border-border border-t p-1 first:border-t-0"
                :class="{ 'opacity-60': isSearching }"
            >
                <p class="text-text-muted px-2.5 pt-2 pb-1 text-xs font-semibold uppercase">
                    {{ group.label }}
                </p>
                <RouterLink
                    v-for="item in group.items"
                    :id="optionId(item)"
                    :key="item.id"
                    :to="item.to"
                    role="option"
                    tabindex="-1"
                    :aria-selected="isHighlighted(item)"
                    class="flex flex-col rounded px-2.5 py-1.5 outline-none"
                    :class="{ 'bg-primary/10': isHighlighted(item) }"
                    @mouseenter="highlight(item)"
                    @click="clear"
                >
                    <span
                        class="truncate text-sm font-medium"
                        :class="{ 'text-primary': item.isMore }"
                    >
                        {{ item.primary }}
                    </span>
                    <span v-if="item.secondary" class="text-text-muted truncate text-xs">
                        {{ item.secondary }}
                    </span>
                </RouterLink>
            </div>
        </div>
    </div>
</template>
