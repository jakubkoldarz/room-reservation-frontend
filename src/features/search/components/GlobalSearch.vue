<script setup lang="ts">
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import { computed, nextTick, ref, useId, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGlobalSearch } from "../composables/useGlobalSearch";
import { useSearchLinks } from "../composables/useSearchLinks";
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
const highlighted = ref(-1);

const placeholder = computed(() => {
    if (canSearchRooms && canSearchBuildings) return "Search rooms and buildings...";
    return canSearchRooms ? "Search rooms..." : "Search buildings...";
});

const groups = computed(() => {
    let index = 0;
    return buildSearchGroups({
        term: term.value,
        rooms: rooms.value,
        buildings: buildings.value,
        links,
    }).map((group) => ({
        ...group,
        items: group.items.map((item) => ({ item, index: index++ })),
    }));
});

const options = computed(() => groups.value.flatMap((group) => group.items));
const isPanelVisible = computed(() => isOpen.value && term.value !== "");
const activeDescendant = computed(() =>
    isPanelVisible.value && highlighted.value >= 0 ? optionId(highlighted.value) : undefined,
);

watch([term, options], () => {
    highlighted.value = -1;
});

watch(highlighted, async (index) => {
    if (index < 0) return;
    await nextTick();
    document.getElementById(optionId(index))?.scrollIntoView({ block: "nearest" });
});

watch(() => route.fullPath, clear);

function optionId(index: number): string {
    return `${inputId}-option-${index}`;
}

function clear(): void {
    query.value = "";
    isOpen.value = false;
}

function move(step: number): void {
    isOpen.value = true;
    const count = options.value.length;
    if (count === 0) return;
    highlighted.value =
        highlighted.value < 0 && step < 0 ? count - 1 : (highlighted.value + step + count) % count;
}

function onEnter(): void {
    if (!term.value) return;
    const target =
        options.value[highlighted.value]?.item.to ??
        (canSearchRooms ? links.roomList(term.value) : links.buildingList(term.value));
    void router.push(target);
    clear();
    input.value?.blur();
}

function onEscape(): void {
    if (isPanelVisible.value) isOpen.value = false;
    else if (query.value) clear();
    else input.value?.blur();
}

function onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && root.value?.contains(event.relatedTarget)) return;
    isOpen.value = false;
}

function clearAndFocus(): void {
    clear();
    input.value?.focus();
}

defineExpose({
    focus: () => input.value?.focus(),
    clear,
});
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
            @focus="isOpen = true"
            @input="isOpen = true"
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
                {{ isSearching ? "Searching..." : `No results for “${term}”` }}
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
                    v-for="{ item, index } in group.items"
                    :id="optionId(index)"
                    :key="item.id"
                    :to="item.to"
                    role="option"
                    tabindex="-1"
                    :aria-selected="index === highlighted"
                    class="flex flex-col rounded px-2.5 py-1.5 outline-none"
                    :class="{ 'bg-primary/10': index === highlighted }"
                    @mouseenter="highlighted = index"
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
