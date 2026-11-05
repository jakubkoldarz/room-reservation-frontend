<script setup lang="ts">
import { computed } from "vue";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import type { Availability } from "../types";
import { DAYS_MONDAY_FIRST, describeDay, slotsForDay } from "../utils/schedule";

const { availabilities, highlightDay } = defineProps<{
    availabilities: readonly Availability[];
    highlightDay?: number;
}>();

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"];

const days = computed(() =>
    DAYS_MONDAY_FIRST.map((dayOfWeek) => ({
        dayOfWeek,
        letter: DAY_LETTERS[dayOfWeek],
        isOpen: slotsForDay(availabilities, dayOfWeek).length > 0,
        label: describeDay(availabilities, dayOfWeek),
    })),
);
</script>

<template>
    <ul class="inline-flex gap-0.5 align-middle" aria-label="Opening days">
        <li v-for="day in days" :key="day.dayOfWeek" :aria-label="day.label" class="flex">
            <BaseTooltip :text="day.label">
                <span
                    aria-hidden="true"
                    class="flex size-5 cursor-help items-center justify-center rounded text-[10px] font-semibold"
                    :class="[
                        day.isOpen
                            ? 'bg-success/15 text-success'
                            : 'bg-text-muted/10 text-text-muted/50',
                        day.dayOfWeek === highlightDay ? 'ring-primary ring-1 ring-offset-1' : '',
                    ]"
                >
                    {{ day.letter }}
                </span>
            </BaseTooltip>
        </li>
    </ul>
</template>
