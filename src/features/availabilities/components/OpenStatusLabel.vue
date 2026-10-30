<script setup lang="ts">
import { computed } from "vue";
import type { Availability } from "../types";
import { describeOpenStatus, getOpenStatus } from "../utils/schedule";

const { availabilities, now } = defineProps<{
    availabilities: readonly Availability[];
    now: Date;
}>();

const status = computed(() => getOpenStatus(availabilities, now));
const isOpen = computed(() => status.value.kind === "open");
</script>

<template>
    <span
        class="inline-flex items-center gap-1.5 text-xs"
        :class="isOpen ? 'text-success' : 'text-text-muted'"
    >
        <span
            class="size-1.5 shrink-0 rounded-full"
            :class="isOpen ? 'bg-success' : 'bg-text-muted/50'"
        ></span>
        {{ describeOpenStatus(status) }}
    </span>
</template>
