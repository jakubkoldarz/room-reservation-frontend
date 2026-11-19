<script setup lang="ts">
import BaseContainer from "@/features/shared/BaseContainer.vue";

defineProps<{
    label: string;
    count: number | null;
    isLoading: boolean;
}>();
</script>

<template>
    <BaseContainer class="flex items-center justify-between gap-3 py-4 sm:py-4">
        <div class="flex flex-col gap-0.5">
            <h2 class="text-text-muted text-xs font-semibold uppercase">{{ label }}</h2>
            <div v-if="isLoading" class="bg-closed h-8 w-12 rounded"></div>
            <p v-else class="text-2xl leading-8 font-bold tabular-nums">{{ count ?? "–" }}</p>
        </div>
        <div class="flex flex-col items-end gap-1 text-sm">
            <slot />
        </div>
    </BaseContainer>
</template>
