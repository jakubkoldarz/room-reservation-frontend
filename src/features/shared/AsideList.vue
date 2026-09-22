<script setup lang="ts">
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import IconButton from "./IconButton.vue";
import type { RouteLocationRaw } from "vue-router";
import { computed, nextTick } from "vue";
import { ref } from "vue";
import Searchbar from "./Searchbar.vue";

const props = defineProps<{
    title: string;
    totalCount?: number;
    isLoading?: boolean;
    searchbarPlaceholder?: string;
    displayCount?: number;
    items?: { id: string; name: string; to: RouteLocationRaw }[];
}>();

const emit = defineEmits<{
    searchbarFocus: [];
    searchbarInput: [string];
}>();

const isSearchbarActive = ref(false);
const searchbarRef = ref<InstanceType<typeof Searchbar>>();
const searchbarModel = ref<string>("");

function onSearchbarClick() {
    isSearchbarActive.value = !isSearchbarActive.value;
    if (isSearchbarActive.value) {
        nextTick(() => searchbarRef.value?.focus());
        searchbarModel.value = "";
        emit("searchbarFocus");
    }
}

const itemsToShow = computed(() => {
    if (!isSearchbarActive.value || !searchbarModel.value) return props.items?.slice(0, props.displayCount);

    return props.items
        ?.filter((item) => item.name.toLowerCase().includes(searchbarModel.value))
        .slice(0, props.displayCount);
});
</script>

<template>
    <div class="flex flex-col">
        <div class="flex items-center mb-2">
            <div v-if="!isSearchbarActive" class="flex items-center min-h-8">
                <p class="text-text-muted text-sm uppercase font-bold">{{ title }}</p>
                <span
                    class="ml-2 text-xs text-primary font-bold bg-primary/10 px-2 min-w-6 text-center py-0 rounded-md border border-primary/15"
                    v-if="totalCount && !isLoading"
                >
                    {{ totalCount }}
                </span>
            </div>
            <div v-else class="min-h-8 flex items-center w-full">
                <Searchbar
                    v-model="searchbarModel"
                    ref="searchbarRef"
                    :placeholder="props.searchbarPlaceholder"
                    class="text-xs border-border w-full"
                />
            </div>
            <span class="grow"></span>
            <IconButton class="size-5 ml-2" @click="onSearchbarClick">
                <MagnifyingGlassIcon v-if="!isSearchbarActive" />
                <XMarkIcon v-else />
            </IconButton>
        </div>
        <ul v-if="isLoading && !isSearchbarActive" class="flex flex-col gap-1">
            <li :key="n" v-for="n in [1, 2, 3]" class="h-6 w-full rounded bg-zinc-200 animate-pulse"></li>
        </ul>
        <ul v-else class="flex flex-col gap-1 min-h-27">
            <li
                v-for="item in itemsToShow"
                :key="item.id"
                class="h-6 w-full flex gap-2 items-center rounded text-sm hover:text-primary text-text"
                :title="item.name"
            >
                <div class="bg-primary size-2 rounded-full shrink-0"></div>
                <RouterLink :to="item.to" class="shrink truncate">
                    {{ item.name }}
                </RouterLink>
            </li>
        </ul>
    </div>
</template>
