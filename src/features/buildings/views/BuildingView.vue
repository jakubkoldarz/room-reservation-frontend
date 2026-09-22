<script setup lang="ts">
import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import type { BuildingDetails } from "@/types/dtos";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import BuildingInfo from "../components/BuildingInfo.vue";
import AvailabilitiesTable from "@/features/shared/AvailabilitiesTable.vue";
import { usePermissions } from "@/composables/usePermissions.ts";
import { Permission } from "@/features/auth/constants/permissions.ts";

const route = useRoute();
const buildingId = computed(() => route.params.buildingId as string);
const building = ref<BuildingDetails | null>();
const { call, isLoading } = useApiCall();
const { hasPermission } = usePermissions();

watch(() => buildingId.value, fetchBuilding, { immediate: true });
async function fetchBuilding() {
    const response = await call(() => apiClient.getBuildingsBuildingId({ params: { buildingId: buildingId.value } }));
    if (response.success) {
        building.value = response.data;
    }
}

const localization = computed(() => {
    const info = building.value?.buildingInfo;
    if (!info) return "";

    const { street, postalCode, city } = info;
    const cityLine = [postalCode, city].filter(Boolean).join(" ");

    return [street, cityLine].filter(Boolean).join(", ");
});
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4">
            <BuildingInfo
                :is-loading="isLoading"
                :name="building?.buildingInfo.name"
                :identifier="building?.buildingInfo.identifier"
                :floors-count="building?.buildingInfo.floorsCount"
                :localization="localization"
            />
            <AvailabilitiesTable
                :is-loading="isLoading"
                title="Building Availabilities"
                :items="building?.availabilities"
                :has-edit-permission="hasPermission(Permission.BuildingEdit)"
            />
            TODO: ADD ROOMS TABLE
        </div>
    </AsideNavbarLayout>
</template>
