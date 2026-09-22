<script setup lang="ts">
import type { Availability } from "@/types/availabilities";
import Container from "./Container.vue";
import { useDate } from "@/composables/useDate.ts";
import { computed } from "vue";
import Skeleton from "./Skeleton.vue";
import PlainButton from "./PlainButton.vue";

const { dayNames, formatTime } = useDate();

const props = defineProps<{
    isLoading?: boolean;
    title: string;
    items?: Availability[];
    hasEditPermission?: boolean;
}>();

const scheduleRows = computed(() =>
    dayNames.map((day, index) => {
        const availability = props.items?.find((i) => i.dayOfWeek === index);
        return {
            day,
            isOpen: availability,
            startTime: availability ? formatTime(availability.startTime) : null,
            endTime: availability ? formatTime(availability.endTime) : null,
        };
    }),
);
</script>

<template>
    <Container class="@container">
        <div class="flex">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <div class="grow"></div>
            <PlainButton v-if="hasEditPermission">Edit</PlainButton>
        </div>
        <hr class="border-border mb-4 mt-2" />
        <ul v-if="!isLoading" class="flex flex-col divide-y divide-border">
            <li v-for="row in scheduleRows" :key="row.day" class="flex py-2 items-center">
                <span :class="[row.isOpen ? 'bg-success' : 'bg-text-muted/50', 'size-2 rounded-full mr-2']"> </span>
                <p class="text-sm">{{ row.day }}</p>
                <div class="grow"></div>
                <p v-if="row.startTime && row.endTime" class="font-mono font-semibold text-sm">
                    {{ row.startTime }} - {{ row.endTime }}
                </p>
                <p v-else class="text-xs text-text-muted/70 tracking-wider">closed</p>
            </li>
        </ul>

        <ul v-else>
            <li v-for="row in scheduleRows" :key="row.day" class="flex py-2 items-center">
                <Skeleton class="w-full" />
            </li>
        </ul>
    </Container>
</template>
