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
    const emptyError = computed(() =>
        toValue(availabilities).length === 0 ? "Open the room on at least one day" : undefined,
    );
    const firstError = computed(
        () => emptyError.value ?? Object.values(dayErrors.value).find(Boolean),
    );

    return { building, isBuildingLoading: isLoading, dayErrors, hints, emptyError, firstError };
}
