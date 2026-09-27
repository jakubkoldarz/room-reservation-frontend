<script setup lang="ts">
import type { Availability } from "@/types/availabilities";
import Container from "@/features/shared/Container.vue";
import { useAvailabilityRow } from "../composables/useAvailabilityRow";
import SlidingCheckbox from "@/features/shared/SlidingCheckbox.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
const props = withDefaults(
    defineProps<{
        isLoading?: boolean;
    }>(),
    {
        isLoading: false,
    },
);

const availabilitiesModel = defineModel<Availability[]>({ default: () => [] });
const { rows, setOpen, setTime } = useAvailabilityRow(
    availabilitiesModel,
    (next) => (availabilitiesModel.value = next),
);
</script>

<template>
    <Container class="@container">
        <slot />
        <ul v-if="!isLoading" class="flex flex-col divide-y divide-border">
            <li v-for="row in rows" :key="row.day" class="flex py-2 items-center">
                <span :class="[row.isOpen ? 'bg-success' : 'bg-text-muted/50', 'size-2 rounded-full mr-2']"> </span>
                <p class="text-sm">{{ row.day }}</p>
                <div class="grow"></div>
                <SlidingCheckbox
                    :label="row.isOpen ? 'Open' : 'Closed'"
                    v-model="row.isOpen"
                    @update:model-value="(value) => setOpen(row.dayOfWeek, value ?? false)"
                />
                <div class="flex gap-2 ml-4 items-center">
                    <BaseInput
                        is-slim
                        type="time"
                        v-model="row.startTime"
                        @change="setTime(row.dayOfWeek, 'startTime', ($event.target as HTMLInputElement).value)"
                    />
                    <span class="text-sm">-</span>
                    <BaseInput
                        is-slim
                        type="time"
                        v-model="row.endTime"
                        @change="setTime(row.dayOfWeek, 'endTime', ($event.target as HTMLInputElement).value)"
                    />
                </div>
            </li>
        </ul>

        <ul v-else>
            <li v-for="row in rows" :key="row.day" class="flex py-2 items-center">
                <Skeleton class="w-full" />
            </li>
        </ul>
    </Container>
</template>
