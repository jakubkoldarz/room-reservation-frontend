<script setup lang="ts">
import { computed } from "vue";
import type { EventInfo } from "@/features/events/types";
import type { Availability } from "../types";
import { describeOpenStatus, getOpenStatus } from "../utils/schedule";

const {
    availabilities,
    now,
    events = [],
} = defineProps<{
    availabilities: readonly Availability[];
    now: Date;
    events?: readonly EventInfo[];
}>();

const status = computed(() => getOpenStatus(availabilities, now, events));
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
