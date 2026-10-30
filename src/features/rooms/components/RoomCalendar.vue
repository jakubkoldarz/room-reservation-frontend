<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import Container from "@/features/shared/Container.vue";
import IconButton from "@/features/shared/IconButton.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
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
} = defineProps<{
    days: readonly CalendarDay[];
    hours: { start: number; end: number };
    now: Date;
    weekLabel: string;
    isCurrentWeek: boolean;
    isLoading?: boolean;
}>();

const emit = defineEmits<{
    previous: [];
    next: [];
    today: [];
}>();
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div class="border-border flex flex-wrap items-center gap-2 border-b p-4">
            <h2 class="text-lg font-semibold">{{ weekLabel }}</h2>
            <span class="grow"></span>
            <OutlineButton class="rounded-lg py-1" :disabled="isCurrentWeek" @click="emit('today')">
                Today
            </OutlineButton>
            <IconButton class="size-8 p-1" aria-label="Previous week" @click="emit('previous')">
                <ChevronLeftIcon />
            </IconButton>
            <IconButton class="size-8 p-1" aria-label="Next week" @click="emit('next')">
                <ChevronRightIcon />
            </IconButton>
        </div>

        <div v-if="isLoading" class="flex flex-col gap-3 p-4">
            <Skeleton v-for="n in 8" :key="n" class="w-full" />
        </div>

        <template v-else>
            <div class="hidden @3xl:block">
                <RoomCalendarGrid :days :hours :now />
            </div>
            <RoomCalendarAgenda :days class="@3xl:hidden" />
        </template>

        <ul
            class="border-border text-text-muted flex flex-wrap gap-x-4 gap-y-2 border-t p-4 text-xs"
        >
            <li v-for="item in LEGEND" :key="item.kind" class="flex items-center gap-1.5">
                <span class="size-3 rounded-sm border-l-4" :class="BLOCK_CLASSES[item.kind]"></span>
                {{ item.label }}
            </li>
            <li class="flex items-center gap-1.5">
                <span
                    class="border-border bg-background size-3 rounded-sm border"
                    :style="{ backgroundImage: CLOSED_HOURS_BACKGROUND }"
                ></span>
                Outside opening hours
            </li>
        </ul>
    </Container>
</template>
