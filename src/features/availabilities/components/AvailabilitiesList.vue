<script setup lang="ts">
import { computed } from "vue";
import { useDate } from "@/composables/useDate";
import LoadingSkeleton from "@/features/shared/LoadingSkeleton.vue";
import type { Availability } from "../types";
import { DAYS_MONDAY_FIRST, formatHours, toMinutes } from "../utils/schedule";

const props = withDefaults(
    defineProps<{
        isLoading?: boolean;
        items?: Availability[];
    }>(),
    {
        isLoading: false,
        items: () => [],
    },
);

type WeekRow = {
    dayOfWeek: number;
    day: string;
    hours: string;
    isToday: boolean;
    bars: { left: string; width: string }[];
};

const MINUTES_IN_DAY = 24 * 60;
const HOUR_MARKS = [6, 12, 18];

const { dayNames } = useDate();
const todayDayOfWeek = new Date().getDay();

function percent(minutes: number): string {
    return `${(minutes / MINUTES_IN_DAY) * 100}%`;
}

function barsForDay(dayOfWeek: number): { left: string; width: string }[] {
    const bars: { left: string; width: string }[] = [];
    for (const item of props.items) {
        if (item.dayOfWeek !== dayOfWeek) continue;
        const start = toMinutes(item.startTime);
        const end = toMinutes(item.endTime);
        bars.push({ left: percent(start), width: percent(end - start) });
    }
    return bars;
}

const rows = computed(() => {
    const result: WeekRow[] = [];
    for (const dayOfWeek of DAYS_MONDAY_FIRST) {
        result.push({
            dayOfWeek,
            day: dayNames[dayOfWeek],
            hours: formatHours(props.items, dayOfWeek),
            isToday: dayOfWeek === todayDayOfWeek,
            bars: barsForDay(dayOfWeek),
        });
    }
    return result;
});

function markPosition(hour: number): string {
    return percent(hour * 60);
}

function markLabel(hour: number): string {
    return `${String(hour).padStart(2, "0")}:00`;
}
</script>

<template>
    <ul v-if="!isLoading" class="-mx-2 flex flex-col gap-0.5">
        <li
            class="text-text-muted hidden grid-cols-[9rem_minmax(0,1fr)_8rem] gap-4 px-2 pb-1 text-[10px] @2xl:grid"
            aria-hidden="true"
        >
            <span></span>
            <span class="relative h-3">
                <span
                    v-for="hour in HOUR_MARKS"
                    :key="hour"
                    class="text-text-muted absolute -translate-x-1/2 tabular-nums"
                    :style="{ left: markPosition(hour) }"
                >
                    {{ markLabel(hour) }}
                </span>
            </span>
            <span></span>
        </li>
        <li
            v-for="row in rows"
            :key="row.dayOfWeek"
            class="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded px-2 py-1.5 @2xl:grid-cols-[9rem_minmax(0,1fr)_8rem]"
            :class="{ 'bg-primary/10': row.isToday }"
            :aria-current="row.isToday ? 'date' : undefined"
        >
            <span class="flex items-center gap-2 text-sm">
                <span
                    class="size-2 shrink-0 rounded-full"
                    :class="row.hours ? 'bg-success' : 'bg-text-muted/40'"
                ></span>
                <span :class="row.isToday ? 'text-primary font-semibold' : 'text-text'">
                    {{ row.day }}
                </span>
                <span v-if="row.isToday" class="text-primary text-xs">Today</span>
            </span>

            <span
                class="bg-closed relative hidden h-2.5 overflow-hidden rounded-full @2xl:block"
                aria-hidden="true"
            >
                <span
                    v-for="(bar, index) in row.bars"
                    :key="index"
                    class="bg-success/70 absolute inset-y-0 rounded-full"
                    :style="bar"
                ></span>
                <span
                    v-for="hour in HOUR_MARKS"
                    :key="hour"
                    class="bg-surface absolute inset-y-0 w-px"
                    :style="{ left: markPosition(hour) }"
                ></span>
            </span>

            <span v-if="row.hours" class="text-right text-sm font-medium tabular-nums">
                {{ row.hours }}
            </span>
            <span v-else class="text-text-muted text-right text-sm">Closed</span>
        </li>
    </ul>

    <ul v-else class="flex flex-col gap-2">
        <li v-for="dayOfWeek in DAYS_MONDAY_FIRST" :key="dayOfWeek">
            <LoadingSkeleton class="w-full" />
        </li>
    </ul>
</template>
