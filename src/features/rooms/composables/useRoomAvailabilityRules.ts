import { computed, type MaybeRefOrGetter, toValue } from "vue";
import type { Availability } from "@/features/availabilities/types";
import { availabilityErrors, boundsHints } from "@/features/availabilities/utils/bounds";
import { useBuildingAvailabilities } from "@/features/buildings/composables/useBuildingAvailabilities";

export function useRoomAvailabilityRules(
    availabilities: MaybeRefOrGetter<readonly Availability[]>,
    buildingId: MaybeRefOrGetter<string>,
) {
    const { building, availabilities: bounds, isLoading } = useBuildingAvailabilities(buildingId);

    const dayErrors = computed(() => availabilityErrors(toValue(availabilities), bounds.value));
    const hints = computed(() => boundsHints(bounds.value));
    const emptyError = computed(() => {
        if (toValue(availabilities).length === 0) return "Open the room on at least one day";
        return undefined;
    });
    const firstError = computed(() => {
        if (emptyError.value) return emptyError.value;

        for (const message of Object.values(dayErrors.value)) {
            if (message) return message;
        }
        return undefined;
    });

    return { building, isBuildingLoading: isLoading, dayErrors, hints, emptyError, firstError };
}
