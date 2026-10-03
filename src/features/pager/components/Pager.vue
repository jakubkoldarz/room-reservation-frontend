<script setup lang="ts">
import PageButton from "./PageButton.vue";

const props = withDefaults(
    defineProps<{
        totalPages: number;
        currentPage: number;
    }>(),
    {
        totalPages: 1,
        currentPage: 1,
    },
);
</script>

<template>
    <div class="flex gap-1">
        <PageButton :page="currentPage - 1" text="<" :disabled="currentPage <= 1" class="pb-0.5!" />

        <template v-if="totalPages <= 1">
            <PageButton :page="1" is-active />
        </template>

        <template v-else-if="totalPages <= 5">
            <PageButton v-for="i in totalPages" :page="i" :is-active="i === currentPage" />
        </template>

        <template v-else>
            <template v-if="currentPage <= 3">
                <PageButton v-for="i in 4" :page="i" :is-active="i === currentPage" />
                <PageButton :page="totalPages" :is-active="currentPage === totalPages" />
            </template>

            <template v-else-if="currentPage >= totalPages - 2">
                <PageButton :page="1" :is-active="currentPage === 1" />
                <PageButton v-for="i in 4" :page="totalPages - 4 + i" :is-active="currentPage === totalPages - 4 + i" />
            </template>

            <template v-else>
                <PageButton :page="1" :is-active="currentPage === 1" />
                <PageButton :page="currentPage - 1" :is-active="currentPage === currentPage - 1" />
                <PageButton :page="currentPage" :is-active="currentPage === currentPage" />
                <PageButton :page="currentPage + 1" :is-active="currentPage === currentPage + 1" />
                <PageButton :page="totalPages" :is-active="currentPage === totalPages" />
            </template>
        </template>

        <PageButton :page="currentPage + 1" text=">" :disabled="currentPage >= totalPages" class="pb-0.5!" />
    </div>
</template>
