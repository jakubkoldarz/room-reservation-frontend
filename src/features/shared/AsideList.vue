<script setup lang="ts">
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import IconButton from "./IconButton.vue";
import type { RouteLocationRaw } from "vue-router";
import { nextTick } from "vue";
import { ref } from "vue";
import Searchbar from "./Searchbar.vue";
import Badge from "./Badge.vue";
import Skeleton from "./Skeleton.vue";

const props = withDefaults(
    defineProps<{
        title: string;
        to?: RouteLocationRaw;
        totalCount?: number;
        isLoading?: boolean;
        searchbarPlaceholder?: string;
        displayCount?: number;
        items?: { id: string; name: string; to?: RouteLocationRaw }[];
    }>(),
    {
        isLoading: false,
        displayCount: 4,
    },
);

const emit = defineEmits<{
    searchbarFocus: [];
    searchbarInput: [string];
}>();

const isSearchbarActive = ref(false);
const searchbarRef = ref<InstanceType<typeof Searchbar>>();

function onSearchbarClick() {
    isSearchbarActive.value = !isSearchbarActive.value;
    if (isSearchbarActive.value) {
        nextTick(() => searchbarRef.value?.focus());
        searchbarModel.value = "";
        emit("searchbarFocus");
    }
}

const searchbarModel = defineModel<string>();
</script>

<template>
    <div class="flex flex-col">
        <div class="mb-2 flex items-center">
            <div v-if="!isSearchbarActive" class="flex min-h-8 items-center">
                <p class="text-sm font-semibold uppercase">
                    <RouterLink v-if="to" :to="to" class="hover:text-primary">
                        {{ title }}
                    </RouterLink>
                    <span v-else>{{ title }}</span>
                </p>
                <Badge v-if="totalCount && !isLoading" class="ml-2 px-2!">
                    {{ totalCount }}
                </Badge>
            </div>
            <div v-else class="flex min-h-8 w-full items-center">
                <Searchbar
                    v-model="searchbarModel"
                    ref="searchbarRef"
                    :placeholder="props.searchbarPlaceholder"
                    class="border-border w-full text-xs"
                />
            </div>
            <span class="grow"></span>
            <IconButton class="ml-2 size-5" @click="onSearchbarClick">
                <MagnifyingGlassIcon v-if="!isSearchbarActive" />
                <XMarkIcon v-else />
            </IconButton>
        </div>
        <ul v-if="isLoading && !isSearchbarActive" class="flex flex-col gap-1">
            <li :key="n" v-for="n in props.displayCount"><Skeleton class="w-full" /></li>
        </ul>
        <ul v-else class="flex min-h-27 flex-col gap-1">
            <li
                v-for="item in items"
                :key="item.id"
                class="hover:text-primary text-text flex h-6 w-full items-center gap-2 rounded text-sm"
                :title="item.name"
            >
                <div class="bg-primary size-2 shrink-0 rounded-full"></div>
                <RouterLink v-if="item.to" :to="item.to" class="shrink truncate">
                    {{ item.name }}
                </RouterLink>
                <span v-else class="shrink truncate">{{ item.name }}</span>
            </li>
        </ul>
    </div>
</template>
