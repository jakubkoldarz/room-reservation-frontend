<script setup lang="ts">
import { AdjustmentsHorizontalIcon, ChevronDownIcon } from "@heroicons/vue/24/solid";

const { activeCount, controls } = defineProps<{
    activeCount: number;
    controls: string;
}>();

const isOpen = defineModel<boolean>({ required: true });
</script>

<template>
    <button
        type="button"
        :aria-controls="controls"
        :aria-expanded="isOpen"
        class="focus-visible:ring-primary flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 @sm:w-auto"
        :class="
            isOpen || activeCount > 0
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'border-border text-text-muted hover:border-primary/30 hover:text-primary'
        "
        @click="isOpen = !isOpen"
    >
        <AdjustmentsHorizontalIcon class="size-4" />
        More filters
        <span
            v-if="activeCount > 0"
            class="bg-primary text-surface rounded-full px-1.5 text-xs font-bold"
        >
            {{ activeCount }}
        </span>
        <ChevronDownIcon class="size-4 transition-transform" :class="{ 'rotate-180': isOpen }" />
    </button>
</template>
