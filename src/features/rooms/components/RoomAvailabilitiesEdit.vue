<script setup lang="ts">
import { computed } from "vue";
import { ArrowsPointingInIcon, DocumentDuplicateIcon } from "@heroicons/vue/24/solid";
import AvailabilitiesEdit from "@/features/availabilities/components/AvailabilitiesEdit.vue";
import type { Availability, DayMessages } from "@/features/availabilities/types";
import { clampToBounds } from "@/features/availabilities/utils/bounds";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import type { BuildingDetails } from "@/features/buildings/types";
import ErrorText from "@/features/shared/ErrorText.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";

const {
    building,
    isLoading = false,
    isBuildingLoading = false,
    dayErrors = {},
    hints = {},
    error,
} = defineProps<{
    building: BuildingDetails | null;
    isLoading?: boolean;
    isBuildingLoading?: boolean;
    dayErrors?: DayMessages;
    hints?: DayMessages;
    error?: string;
}>();

const availabilities = defineModel<Availability[]>({ required: true });

const toasts = useToastsStore();

const hasDayErrors = computed(() => Object.values(dayErrors).some(Boolean));

function copyFromBuilding(): void {
    if (!building) return;
    availabilities.value = building.availabilities.map(({ dayOfWeek, startTime, endTime }) => ({
        dayOfWeek,
        startTime,
        endTime,
    }));
    toasts.pushInfo({
        title: "Availabilities copied",
        message: `Copied from "${building.buildingInfo.name}"`,
    });
}

function fitToBuilding(): void {
    if (!building) return;
    availabilities.value = clampToBounds(availabilities.value, building.availabilities);
}
</script>

<template>
    <AvailabilitiesEdit v-model="availabilities" :is-loading :errors="dayErrors" :hints>
        <div class="flex flex-wrap items-center gap-2">
            <NumberCircle>3</NumberCircle>
            <h2 class="text-lg font-semibold">Room availabilities</h2>
            <span class="grow"></span>
            <OutlineButton
                v-if="building && hasDayErrors"
                :disabled="isLoading"
                class="border-primary/30! text-primary! hover:bg-primary/10! w-full justify-center rounded-lg py-1 disabled:cursor-not-allowed disabled:opacity-50! disabled:hover:bg-transparent! @sm:w-auto"
                @click="fitToBuilding"
            >
                <ArrowsPointingInIcon class="size-4" />
                Fit to building hours
            </OutlineButton>
            <OutlineButton
                v-if="building || isBuildingLoading"
                :disabled="!building || isLoading"
                :is-loading="isBuildingLoading"
                class="border-primary/30! text-primary! hover:bg-primary/10! w-full justify-center rounded-lg py-1 disabled:cursor-not-allowed disabled:opacity-50! disabled:hover:bg-transparent! @sm:w-auto"
                @click="copyFromBuilding"
            >
                <DocumentDuplicateIcon v-if="!isBuildingLoading" class="size-4" />
                Copy from building
            </OutlineButton>
        </div>
        <p class="text-text-muted text-sm">
            <slot />
            Opening hours must fit within the building's hours. Special events can override them on
            specific dates.
        </p>
        <ErrorText :error class="mt-2 mb-0! text-left!" />
        <hr class="border-border my-2" />
    </AvailabilitiesEdit>
</template>
