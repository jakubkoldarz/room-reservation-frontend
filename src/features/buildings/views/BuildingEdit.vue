<script setup lang="ts">
import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import type { BuildingDetails } from "@/types/dtos";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import EditHeader from "../components/EditHeader.vue";
import EditInfo from "../components/EditInfo.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore.ts";
import router from "@/router/index.ts";
import { buildingRoutes } from "../routes.ts";
import { useBuildingsStore } from "../stores/useBuildingsStore.ts";
import NumberCircle from "../components/NumberCircle.vue";
import type { Availability } from "@/types/availabilities.ts";
import AvailabilitiesEdit from "@/features/availabilities/components/AvailabilitiesEdit.vue";

const editRef = ref<InstanceType<typeof EditInfo>>();
const availabilitiesModel = ref<Availability[]>([]);

const buildingsStore = useBuildingsStore();
const route = useRoute();
const buildingId = computed(() => route.params.buildingId as string);
const building = ref<BuildingDetails | null>();
const { call, isLoading } = useApiCall();

watch(() => buildingId.value, fetchBuilding, { immediate: true });
async function fetchBuilding() {
    const response = await call(() => apiClient.getBuildingsBuildingId({ params: { buildingId: buildingId.value } }));
    if (response.success) {
        building.value = response.data;
        availabilitiesModel.value = response.data.availabilities;
    }
}

async function handleSave() {
    const values = await editRef.value?.submit();
    if (!values) return;

    const toastsStore = useToastsStore();

    const response = await call(() =>
        apiClient.putBuildingsBuildingId(
            {
                ...values,
                availabilities: availabilitiesModel.value,
            },
            { params: { buildingId: buildingId.value } },
        ),
    );

    if (response.success) {
        toastsStore.pushSuccess({ message: "Building updated successfully" });
        buildingsStore.fetchBuildings();
        gotoBuildingView();
    } else if (response.success === false) {
        toastsStore.pushApiError({
            title: "Failed to update building",
            error: response.error,
        });
    }
}

function gotoBuildingView() {
    router.push({ name: buildingRoutes.view.name, params: { buildingId: buildingId.value } });
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4 pb-20">
            <EditHeader
                :name="building?.buildingInfo.name"
                :is-loading="isLoading"
                @save="handleSave"
                @cancel="gotoBuildingView"
            />
            <EditInfo ref="editRef" :building="building?.buildingInfo" :is-loading="isLoading" />
            <AvailabilitiesEdit v-model="availabilitiesModel" :is-loading="isLoading">
                <div class="flex gap-2 items-center">
                    <NumberCircle>2</NumberCircle>
                    <h2 class="text-lg font-semibold">Building availabilities</h2>
                </div>
                <p class="text-text-muted text-sm">
                    Edit the building's availabilities. Availabilities define the time slots when the building is open
                    for reservations.
                </p>
                <hr class="border-border my-2" />
            </AvailabilitiesEdit>
        </div>
    </AsideNavbarLayout>
</template>
