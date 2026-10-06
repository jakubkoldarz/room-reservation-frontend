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
        items?: { id: string; name: string; to: RouteLocationRaw }[];
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
        <div class="flex items-center mb-2">
            <div v-if="!isSearchbarActive" class="flex items-center min-h-8">
                <p class="text-sm uppercase font-semibold">
                    <RouterLink v-if="to" :to="to" class="hover:text-primary">
                        {{ title }}
                    </RouterLink>
                    <span v-else>{{ title }}</span>
                </p>
                <Badge v-if="totalCount && !isLoading" class="ml-2 px-2!">
                    {{ totalCount }}
                </Badge>
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
            <li :key="n" v-for="n in props.displayCount"><Skeleton class="w-full" /></li>
        </ul>
        <ul v-else class="flex flex-col gap-1 min-h-27">
            <li
                v-for="item in items"
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
