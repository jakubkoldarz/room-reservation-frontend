<script setup lang="ts">
import type { Availability } from "../types";
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
        <ul v-if="!isLoading" class="divide-border flex flex-col divide-y">
            <li
                v-for="row in rows"
                :key="row.day"
                class="flex flex-col gap-2 py-3 @lg:flex-row @lg:items-center @lg:py-2"
            >
                <div class="flex items-center @lg:grow">
                    <span
                        :class="[
                            row.isOpen ? 'bg-success' : 'bg-text-muted/50',
                            'mr-2 size-2 shrink-0 rounded-full',
                        ]"
                    >
                    </span>
                    <p class="text-sm">{{ row.day }}</p>
                    <div class="grow"></div>
                    <SlidingCheckbox
                        :label="row.isOpen ? 'Open' : 'Closed'"
                        v-model="row.isOpen"
                        @update:model-value="(value) => setOpen(row.dayOfWeek, value ?? false)"
                    />
                </div>
                <div
                    class="items-center gap-2 pl-4 @lg:ml-4 @lg:pl-0"
                    :class="row.isOpen ? 'flex' : 'hidden @lg:flex'"
                >
                    <div class="min-w-0 flex-1 @lg:w-32 @lg:flex-none">
                        <BaseInput
                            is-slim
                            type="time"
                            v-model="row.startTime"
                            @change="
                                setTime(
                                    row.dayOfWeek,
                                    'startTime',
                                    ($event.target as HTMLInputElement).value,
                                )
                            "
                        />
                    </div>
                    <span class="text-sm">-</span>
                    <div class="min-w-0 flex-1 @lg:w-32 @lg:flex-none">
                        <BaseInput
                            is-slim
                            type="time"
                            v-model="row.endTime"
                            @change="
                                setTime(
                                    row.dayOfWeek,
                                    'endTime',
                                    ($event.target as HTMLInputElement).value,
                                )
                            "
                        />
                    </div>
                </div>
            </li>
        </ul>

        <ul v-else>
            <li v-for="row in rows" :key="row.day" class="flex items-center py-2">
                <Skeleton class="w-full" />
            </li>
        </ul>
    </Container>
</template>
