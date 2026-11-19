<script setup lang="ts">
import BaseBadge from "@/features/shared/BaseBadge.vue";
import BaseContainer from "@/features/shared/BaseContainer.vue";

defineProps<{
    title: string;
    count?: number;
}>();
</script>

<template>
    <BaseContainer class="flex flex-col">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <BaseBadge v-if="count" type="warning" class="shrink-0 px-2!">{{ count }}</BaseBadge>
            <span class="ml-auto shrink-0 text-sm">
                <slot name="action" />
            </span>
        </div>
        <hr class="border-border mt-2 mb-3" />
        <slot />
    </BaseContainer>
</template>
