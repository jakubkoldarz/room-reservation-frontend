<script setup lang="ts">
import Container from "@/features/shared/Container.vue";

defineProps<{
    label: string;
    count: number | null;
    isLoading: boolean;
}>();
</script>

<template>
    <Container class="flex items-center justify-between gap-3 py-4 sm:py-4">
        <div class="flex flex-col gap-0.5">
            <h2 class="text-text-muted text-xs font-semibold uppercase">{{ label }}</h2>
            <div v-if="isLoading" class="h-8 w-12 rounded bg-gray-200"></div>
            <p v-else class="text-2xl leading-8 font-bold tabular-nums">{{ count ?? "–" }}</p>
        </div>
        <div class="flex flex-col items-end gap-1 text-sm">
            <slot />
        </div>
    </Container>
</template>
