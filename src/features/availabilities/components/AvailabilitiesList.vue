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
    <ul v-if="!isLoading" class="divide-border flex flex-col divide-y">
        <li v-for="row in rows" :key="row.day" class="flex items-center py-2">
            <span
                :class="[
                    row.isOpen ? 'bg-success' : 'bg-text-muted/50',
                    'mr-2 size-2 rounded-full',
                ]"
            >
            </span>
            <p class="text-sm">{{ row.day }}</p>
            <div class="grow"></div>
            <p v-if="row.startTime && row.endTime" class="font-mono text-sm font-semibold">
                {{ row.startTime }} - {{ row.endTime }}
            </p>
            <p v-else class="text-text-muted/70 text-xs tracking-wider">closed</p>
        </li>
    </ul>

    <ul v-else>
        <li v-for="row in rows" :key="row.day" class="flex items-center py-2">
            <Skeleton class="w-full" />
        </li>
    </ul>
</template>
