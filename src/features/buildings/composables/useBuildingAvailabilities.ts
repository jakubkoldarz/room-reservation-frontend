import { computed, ref, shallowRef, toValue, watch, type MaybeRefOrGetter } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import type { Availability } from "@/features/availabilities/types";
import type { BuildingDetails } from "../types";

export function useBuildingAvailabilities(buildingId: MaybeRefOrGetter<string>) {
    const building = shallowRef<BuildingDetails | null>(null);
    const isLoading = ref(false);
    const { hasPermission } = usePermissions();

    watch(
        () => toValue(buildingId),
        async (id) => {
            building.value = null;
            if (!id || !hasPermission(Permission.BuildingView)) return;

            isLoading.value = true;
            const result = await apiCall(() =>
                apiClient.getBuildingsBuildingId({ params: { buildingId: id } }),
            );
            if (toValue(buildingId) !== id) return;
            isLoading.value = false;
            if (result.ok) building.value = result.data;
        },
        { immediate: true },
    );

    const availabilities = computed<readonly Availability[] | null>(
        () => building.value?.availabilities ?? null,
    );

    return { building, availabilities, isLoading };
}
