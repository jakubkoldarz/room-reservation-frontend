<script setup lang="ts">
import { RectangleStackIcon } from "@heroicons/vue/24/outline";

const { onLight = false } = defineProps<{
    onLight?: boolean;
}>();
</script>

<template>
    <div class="flex gap-1">
        <div class="bg-primary text-surface size-6 shrink-0 rounded p-0.5">
            <RectangleStackIcon />
        </div>
        <p
            class="tracking-wide select-none"
            :class="onLight ? 'text-text font-semibold' : 'text-surface'"
        >
            RoomReservation
        </p>
    </div>
</template>
