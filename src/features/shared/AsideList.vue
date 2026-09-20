<script setup lang="ts">
import { MagnifyingGlassIcon } from "@heroicons/vue/24/solid";
import IconButton from "./IconButton.vue";

const props = defineProps<{
    title: string;
    totalCount?: number;
    isLoading?: boolean;
    items?: { id: string; name: string }[];
}>();
</script>

<template>
    <div class="flex flex-col">
        <div class="flex items-center mb-2">
            <p class="text-text-muted text-sm uppercase font-bold">{{ title }}</p>
            <span
                class="ml-2 text-xs text-primary font-bold bg-primary/10 px-2 min-w-6 text-center py-0 rounded-md border border-primary/15"
                v-if="totalCount"
            >
                {{ totalCount }}
            </span>
            <span class="grow"></span>
            <IconButton class="size-4">
                <MagnifyingGlassIcon />
            </IconButton>
        </div>
        <ul v-if="isLoading" class="flex flex-col gap-1">
            <li class="h-4 w-full rounded bg-zinc-200 animate-pulse" v-for="_ in [1, 2, 3]"></li>
        </ul>
        <ul v-if="!isLoading" class="flex flex-col gap-1">
            <li class="h-4 w-full rounded text-sm text-text line-clamp-1" v-for="item in items">
                {{ item.name }}
            </li>
        </ul>
    </div>
</template>
