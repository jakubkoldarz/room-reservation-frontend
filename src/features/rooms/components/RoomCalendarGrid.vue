<script setup lang="ts">
import { computed } from "vue";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import type { CalendarBlock, CalendarDay } from "../types";
import { BLOCK_CLASSES, CLOSED_HOURS_BACKGROUND } from "../utils/calendarStyles";

const { days, hours, now } = defineProps<{
    days: readonly CalendarDay[];
    hours: { start: number; end: number };
    now: Date;
}>();

const HOUR_HEIGHT = 48;

const rangeStart = computed(() => hours.start * 60);
const rangeEnd = computed(() => hours.end * 60);
const bodyHeight = computed(() => (hours.end - hours.start) * HOUR_HEIGHT);
const hourMarks = computed(() =>
    Array.from({ length: hours.end - hours.start + 1 }, (_, index) => hours.start + index),
);
const hasAllDay = computed(() => days.some((day) => day.allDay.length > 0));
const nowMinutes = computed(() => now.getHours() * 60 + now.getMinutes());

function offset(minutes: number): number {
    const clamped = Math.min(Math.max(minutes, rangeStart.value), rangeEnd.value);
    return ((clamped - rangeStart.value) / 60) * HOUR_HEIGHT;
}

function intervalStyle(start: number, end: number) {
    return { top: `${offset(start)}px`, height: `${offset(end) - offset(start)}px` };
}

function blockStyle(block: CalendarBlock) {
    return {
        ...intervalStyle(block.start, block.end),
        left: `calc(${(block.lane / block.lanes) * 100}% + 2px)`,
        width: `calc(${100 / block.lanes}% - 4px)`,
    };
}

function weekday(date: Date): string {
    return new Intl.DateTimeFormat("en-GB", { weekday: "short" }).format(date);
}
</script>

<template>
    <div class="grid grid-cols-[3.5rem_repeat(7,minmax(0,1fr))]">
        <div class="border-border border-b"></div>
        <div
            v-for="day in days"
            :key="day.iso"
            class="border-border flex flex-col items-center gap-0.5 border-b border-l py-2 text-xs"
        >
            <span class="text-text-muted uppercase">{{ weekday(day.date) }}</span>
            <span
                class="flex size-7 items-center justify-center rounded-full text-sm font-semibold"
                :class="day.isToday ? 'bg-primary text-surface' : 'text-text'"
            >
                {{ day.date.getDate() }}
            </span>
        </div>

        <template v-if="hasAllDay">
            <div class="border-border text-text-muted border-b py-1 pr-2 text-right text-[10px]">
                All day
            </div>
            <div
                v-for="day in days"
                :key="`all-day-${day.iso}`"
                class="border-border flex min-w-0 flex-col gap-1 border-b border-l p-1"
            >
                <BaseTooltip
                    v-for="item in day.allDay"
                    :key="item.id"
                    :text="item.isClosed ? `Closed: ${item.title}` : item.title"
                    class="min-w-0 truncate rounded border-l-4 px-1.5 py-0.5 text-xs font-medium"
                    :class="item.isClosed ? BLOCK_CLASSES.closed : BLOCK_CLASSES.event"
                >
                    <span class="truncate">{{ item.title }}</span>
                </BaseTooltip>
            </div>
        </template>

        <div class="relative" :style="{ height: `${bodyHeight}px` }">
            <span
                v-for="hour in hourMarks"
                :key="hour"
                class="text-text-muted absolute right-2 -translate-y-1/2 text-[10px]"
                :style="{ top: `${(hour - hours.start) * HOUR_HEIGHT}px` }"
            >
                {{ String(hour).padStart(2, "0") }}:00
            </span>
        </div>

        <div
            v-for="day in days"
            :key="`body-${day.iso}`"
            class="border-border bg-background relative border-l"
            :style="{ height: `${bodyHeight}px`, backgroundImage: CLOSED_HOURS_BACKGROUND }"
        >
            <div
                v-for="(interval, index) in day.openIntervals"
                :key="index"
                class="bg-surface absolute inset-x-0"
                :style="intervalStyle(interval.start, interval.end)"
            ></div>

            <div
                v-for="hour in hourMarks"
                :key="hour"
                class="border-border/60 pointer-events-none absolute inset-x-0 border-t"
                :style="{ top: `${(hour - hours.start) * HOUR_HEIGHT}px` }"
            ></div>

            <BaseTooltip
                v-for="block in day.blocks"
                :key="block.id"
                :text="block.tooltip"
                class="absolute cursor-default flex-col overflow-hidden rounded border-l-4 px-1.5 py-0.5 text-xs"
                :class="BLOCK_CLASSES[block.kind]"
                :style="blockStyle(block)"
            >
                <span class="truncate font-semibold">{{ block.time }}</span>
                <span class="truncate">{{ block.title }}</span>
                <span
                    v-if="block.detail && block.end - block.start >= 60"
                    class="truncate opacity-80"
                >
                    {{ block.detail }}
                </span>
            </BaseTooltip>

            <div
                v-if="day.isToday && nowMinutes >= hours.start * 60 && nowMinutes <= hours.end * 60"
                class="bg-danger pointer-events-none absolute inset-x-0 z-10 h-0.5"
                :style="{ top: `${offset(nowMinutes)}px` }"
            >
                <span class="bg-danger absolute -top-1 -left-1 size-2.5 rounded-full"></span>
            </div>
        </div>
    </div>
</template>
