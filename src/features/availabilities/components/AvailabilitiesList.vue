<script setup lang="ts">
import Skeleton from "@/features/shared/Skeleton.vue";
import type { Availability } from "@/types/availabilities";
import { useAvailabilityRow } from "../composables/useAvailabilityRow";

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

const { rows } = useAvailabilityRow(() => props.items);
</script>

<template>
    <ul v-if="!isLoading" class="flex flex-col divide-y divide-border">
        <li v-for="row in rows" :key="row.day" class="flex py-2 items-center">
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
        <li v-for="row in rows" :key="row.day" class="flex py-2 items-center">
            <Skeleton class="w-full" />
        </li>
    </ul>
</template>
