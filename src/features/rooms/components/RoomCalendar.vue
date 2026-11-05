<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import Container from "@/features/shared/Container.vue";
import IconButton from "@/features/shared/IconButton.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { computed } from "vue";
import type { CalendarDay } from "../types";
import { BLOCK_CLASSES, CLOSED_HOURS_BACKGROUND, LEGEND } from "../utils/calendarStyles";
import RoomCalendarAgenda from "./RoomCalendarAgenda.vue";
import RoomCalendarGrid from "./RoomCalendarGrid.vue";

const {
    days,
    hours,
    now,
    weekLabel,
    isCurrentWeek,
    isLoading = false,
    title,
    notice,
    showOpeningHours = true,
} = defineProps<{
    days: readonly CalendarDay[];
    hours: { start: number; end: number };
    now: Date;
    weekLabel: string;
    isCurrentWeek: boolean;
    isLoading?: boolean;
    title?: string;
    notice?: string;
    showOpeningHours?: boolean;
}>();

const legend = computed(() =>
    showOpeningHours
        ? LEGEND
        : LEGEND.filter((item) => item.kind !== "event" && item.kind !== "closed"),
);

const emit = defineEmits<{
    previous: [];
    next: [];
    today: [];
}>();
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div class="border-border flex items-center gap-3 border-b p-4">
            <div class="flex min-w-0 flex-1 flex-col @md:flex-row @md:items-baseline @md:gap-2">
                <h2 class="truncate text-lg font-semibold">{{ title ?? weekLabel }}</h2>
                <span v-if="title" class="text-text-muted truncate text-sm">{{ weekLabel }}</span>
            </div>
            <div class="flex shrink-0 items-center gap-1">
                <OutlineButton
                    class="mr-1 rounded-lg py-1"
                    :disabled="isCurrentWeek"
                    @click="emit('today')"
                >
                    Today
                </OutlineButton>
                <IconButton
                    class="grid size-8 place-items-center p-1"
                    aria-label="Previous week"
                    @click="emit('previous')"
                >
                    <ChevronLeftIcon class="size-5" />
                </IconButton>
                <IconButton
                    class="grid size-8 place-items-center p-1"
                    aria-label="Next week"
                    @click="emit('next')"
                >
                    <ChevronRightIcon class="size-5" />
                </IconButton>
            </div>
        </div>

        <p
            v-if="notice"
            class="border-border bg-background text-text-muted border-b px-4 py-2 text-sm"
        >
            {{ notice }}
        </p>

        <div class="hidden @3xl:block">
            <RoomCalendarGrid :days :hours :now :show-opening-hours :is-loading />
        </div>
        <div v-if="isLoading" class="flex animate-pulse flex-col gap-3 p-4 @3xl:hidden">
            <Skeleton v-for="n in 7" :key="n" class="w-full" />
        </div>
        <RoomCalendarAgenda v-else :days :show-opening-hours class="@3xl:hidden" />

        <ul
            class="border-border text-text-muted flex flex-wrap gap-x-4 gap-y-2 border-t p-4 text-xs"
        >
            <li v-for="item in legend" :key="item.kind" class="flex items-center gap-1.5">
                <span class="size-3 rounded-sm border-l-4" :class="BLOCK_CLASSES[item.kind]"></span>
                {{ item.label }}
            </li>
            <li v-if="showOpeningHours" class="flex items-center gap-1.5">
                <span
                    class="border-border bg-background size-3 rounded-sm border"
                    :style="{ backgroundImage: CLOSED_HOURS_BACKGROUND }"
                ></span>
                Outside opening hours
            </li>
        </ul>
    </Container>
</template>
