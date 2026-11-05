<script setup lang="ts">
import { roomConflicts } from "@/features/rooms/utils/conflicts";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import apiClient from "@/api/client";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import FormHeader from "@/features/shared/FormHeader.vue";
import EditInfo from "../components/EditInfo.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore.ts";
import router from "@/router/index.ts";
import { useBuildingDestination } from "../composables/useBuildingDestination";
import { useBuildingsStore } from "../stores/useBuildingsStore.ts";
import NumberCircle from "../components/NumberCircle.vue";
import type { Availability } from "@/features/availabilities/types.ts";
import AvailabilitiesEdit from "@/features/availabilities/components/AvailabilitiesEdit.vue";
import type { BuildingDetails } from "../types.ts";

const editRef = ref<InstanceType<typeof EditInfo>>();
const availabilitiesModel = ref<Availability[]>([]);

const buildingsStore = useBuildingsStore();
const destinationFor = useBuildingDestination();
const route = useRoute();
const buildingId = computed(() => route.params.buildingId as string);
const building = ref<BuildingDetails | null>();
const isLoading = ref(false);
const isSaving = ref(false);
const toastsStore = useToastsStore();

watch(() => buildingId.value, fetchBuilding, { immediate: true });
async function fetchBuilding() {
    isLoading.value = true;
    const response = await apiCall(() =>
        apiClient.getBuildingsBuildingId({ params: { buildingId: buildingId.value } }),
    );
    isLoading.value = false;

    if (response.ok) {
        building.value = response.data;
        availabilitiesModel.value = response.data.availabilities;
    } else {
        toastsStore.pushError({
            title: "Failed to load building",
            message: apiErrorMessage(response.error),
        });
    }
}

async function handleSave() {
    if (isSaving.value) return;
    const values = await editRef.value?.submit();
    if (!values) return;

    isSaving.value = true;
    const response = await apiCall(() =>
        apiClient.putBuildingsBuildingId(
            {
                ...values,
                availabilities: availabilitiesModel.value,
            },
            { params: { buildingId: buildingId.value } },
        ),
    );
    isSaving.value = false;

    if (response.ok) {
        toastsStore.pushSuccess({ message: "Building updated successfully" });
        buildingsStore.fetchBuildings();
        gotoBuildingView();
        return;
    }
    if (response.error.kind === "validation") {
        editRef.value?.showServerErrors(response.error.fieldErrors);
    }
    const rooms = roomConflicts(response.error).map((room) => room.identifier);
    toastsStore.pushError({
        title: "Failed to update building",
        message:
            rooms.length > 0
                ? `These rooms would be open outside the new building hours: ${rooms.join(", ")}. Change their hours first.`
                : apiErrorMessage(response.error),
    });
}

function gotoBuildingView() {
    router.push(destinationFor(buildingId.value));
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4 pb-20">
            <FormHeader
                mode="edit"
                :is-saving
                :title="building?.buildingInfo.name"
                :is-loading="isLoading"
                @save="handleSave"
                @cancel="gotoBuildingView"
            />
            <EditInfo ref="editRef" :building="building?.buildingInfo" :is-loading="isLoading" />
            <AvailabilitiesEdit v-model="availabilitiesModel" :is-loading="isLoading">
                <div class="flex items-center gap-2">
                    <NumberCircle>2</NumberCircle>
                    <h2 class="text-lg font-semibold">Building availabilities</h2>
                </div>
                <p class="text-text-muted text-sm">
                    Edit the building's availabilities. Availabilities define the time slots when
                    the building is open for reservations.
                </p>
                <hr class="border-border my-2" />
            </AvailabilitiesEdit>
        </div>
    </AsideNavbarLayout>
</template>
