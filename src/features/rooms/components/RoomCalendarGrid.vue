<script setup lang="ts">
import { computed } from "vue";
import ReservationDetails from "@/features/reservations/components/ReservationDetails.vue";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import type { CalendarDay } from "../types";
import { overrideLabel } from "../utils/calendar";
import { BLOCK_CLASSES, CLOSED_HOURS_BACKGROUND } from "../utils/calendarStyles";

const {
    days,
    hours,
    now,
    showOpeningHours = true,
    isLoading = false,
} = defineProps<{
    days: readonly CalendarDay[];
    hours: { start: number; end: number };
    now: Date;
    showOpeningHours?: boolean;
    isLoading?: boolean;
}>();

const BODY_HEIGHT = 480;

const rangeStart = computed(() => hours.start * 60);
const rangeEnd = computed(() => hours.end * 60);
const hourHeight = computed(() => BODY_HEIGHT / (hours.end - hours.start));
const hourMarks = computed(() =>
    Array.from({ length: hours.end - hours.start + 1 }, (_, index) => hours.start + index),
);
const hasAllDay = computed(() => !isLoading && days.some((day) => day.allDay.length > 0));
const nowMinutes = computed(() => now.getHours() * 60 + now.getMinutes());

function offset(minutes: number): number {
    const clamped = Math.min(Math.max(minutes, rangeStart.value), rangeEnd.value);
    return ((clamped - rangeStart.value) / 60) * hourHeight.value;
}

function hourTop(hour: number): string {
    return `${offset(hour * 60)}px`;
}

function intervalStyle(start: number, end: number) {
    return { top: `${offset(start)}px`, height: `${offset(end) - offset(start)}px` };
}

function blockStyle(block: { start: number; end: number; lane: number; lanes: number }) {
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
                Events
            </div>
            <div
                v-for="day in days"
                :key="`all-day-${day.iso}`"
                class="border-border flex min-w-0 flex-col gap-1 border-b border-l p-1"
            >
                <BaseTooltip
                    v-for="item in day.allDay"
                    :key="item.id"
                    :text="overrideLabel(item)"
                    class="min-w-0 truncate rounded border-l-4 px-1.5 py-0.5 text-xs font-medium"
                    :class="item.isClosed ? BLOCK_CLASSES.closed : BLOCK_CLASSES.event"
                >
                    <span class="truncate">{{ item.title }}</span>
                </BaseTooltip>
            </div>
        </template>

        <div class="relative" :style="{ height: `${BODY_HEIGHT}px` }">
            <span
                v-for="hour in hourMarks.slice(0, -1)"
                :key="hour"
                class="text-text-muted absolute right-2 mt-0.5 text-[10px] leading-none"
                :style="{ top: hourTop(hour) }"
            >
                {{ String(hour).padStart(2, "0") }}:00
            </span>
        </div>

        <div
            v-for="day in days"
            :key="`body-${day.iso}`"
            class="border-border relative border-l"
            :class="showOpeningHours && !isLoading ? 'bg-background' : 'bg-surface'"
            :style="{
                height: `${BODY_HEIGHT}px`,
                backgroundImage:
                    showOpeningHours && !isLoading ? CLOSED_HOURS_BACKGROUND : undefined,
            }"
        >
            <div v-if="isLoading" class="absolute inset-1 animate-pulse rounded bg-gray-200"></div>

            <template v-else>
                <div
                    v-for="(interval, index) in showOpeningHours ? day.openIntervals : []"
                    :key="index"
                    class="bg-surface absolute inset-x-0"
                    :style="intervalStyle(interval.start, interval.end)"
                ></div>

                <div
                    v-for="hour in hourMarks.slice(1, -1)"
                    :key="hour"
                    class="border-border/60 pointer-events-none absolute inset-x-0 border-t"
                    :style="{ top: hourTop(hour) }"
                ></div>

                <BaseTooltip
                    v-for="block in day.grid.blocks"
                    :key="block.id"
                    variant="card"
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
                    <template #content>
                        <ReservationDetails
                            :reservation="block.reservation"
                            :state="block.kind"
                            :room="block.room"
                        />
                    </template>
                </BaseTooltip>

                <BaseTooltip
                    v-for="more in day.grid.more"
                    :key="more.id"
                    :text="more.tooltip"
                    class="border-text-muted/40 bg-surface text-text absolute cursor-default items-center justify-center rounded border border-dashed text-xs font-semibold"
                    :style="blockStyle(more)"
                >
                    <span>+{{ more.count }}</span>
                </BaseTooltip>

                <div
                    v-if="day.isToday && nowMinutes >= rangeStart && nowMinutes <= rangeEnd"
                    class="bg-danger pointer-events-none absolute inset-x-0 z-10 h-0.5"
                    :style="{ top: `${offset(nowMinutes)}px` }"
                >
                    <span class="bg-danger absolute -top-1 -left-1 size-2.5 rounded-full"></span>
                </div>
            </template>
        </div>
    </div>
</template>
