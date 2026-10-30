<script setup lang="ts">
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import apiClient from "@/api/client";
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
import { useToastsStore } from "@/features/toasts/stores/useToastsStore.ts";

const route = useRoute();
const buildingId = computed(() => route.params.buildingId as string);
const building = ref<BuildingDetails | null>();
const isLoading = ref(false);
const { hasPermission } = usePermissions();
const toasts = useToastsStore();

watch(() => buildingId.value, fetchBuilding, { immediate: true });
async function fetchBuilding() {
    isLoading.value = true;
    const response = await apiCall(() =>
        apiClient.getBuildingsBuildingId({ params: { buildingId: buildingId.value } }),
    );
    isLoading.value = false;

    if (response.ok) {
        building.value = response.data;
    } else {
        toasts.pushError({
            title: "Failed to load building",
            message: apiErrorMessage(response.error),
        });
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
