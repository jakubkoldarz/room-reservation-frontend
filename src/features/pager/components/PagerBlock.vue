<script setup lang="ts">
import { computed } from "vue";
import PageButton from "./PageButton.vue";
import { pageWindow } from "../utils/pageWindow";

const { current, total } = defineProps<{
    current: number;
    total: number;
}>();

const items = computed(() => pageWindow(current, total));
</script>

<template>
    <nav class="flex gap-1" aria-label="Pagination">
        <PageButton :page="current - 1" :disabled="current <= 1" label="Previous page">
            &lt;
        </PageButton>

        <template v-for="item in items" :key="item.kind === 'page' ? item.page : item.key">
            <PageButton v-if="item.kind === 'page'" :page="item.page" :is-active="item.active" />
            <span v-else class="text-text-muted flex min-w-8 items-end justify-center select-none">
                …
            </span>
        </template>

        <PageButton :page="current + 1" :disabled="current >= total" label="Next page">
            &gt;
        </PageButton>
    </nav>
</template>
