<script setup lang="ts">
import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import BuildingInfo from "../components/BuildingInfo.vue";
import { usePermissions } from "@/composables/usePermissions.ts";
import { Permission } from "@/features/auth/constants/permissions.ts";
import router from "@/router/index.ts";
import { buildingRoutes } from "../routes.ts";
import AvailabilitiesTable from "@/features/availabilities/components/AvailabilitiesTable.vue";
import { formatAddress } from "../utils/formatAddres.ts";
import type { BuildingDetails } from "../types.ts";

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
    } else {
        router.push({ name: buildingRoutes.list.name });
    }
}

const localization = computed(() => {
    if (!building.value) return null;
    return formatAddress(building.value.buildingInfo);
});

function gotoBuildingEdit() {
    router.push({ name: buildingRoutes.edit.name, params: { buildingId: buildingId.value } });
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4">
            <BuildingInfo
                :is-loading="isLoading"
                :building-id="buildingId"
                :name="building?.buildingInfo.name"
                :identifier="building?.buildingInfo.identifier"
                :floors-count="building?.buildingInfo.floorsCount"
                :localization="localization"
            />
            <AvailabilitiesTable
                @edit="gotoBuildingEdit"
                :is-loading="isLoading"
                title="Building Availabilities"
                :items="building?.availabilities"
                :has-edit-permission="hasPermission(Permission.BuildingEdit)"
            />
            TODO: ADD ROOMS TABLE
        </div>
    </AsideNavbarLayout>
</template>
