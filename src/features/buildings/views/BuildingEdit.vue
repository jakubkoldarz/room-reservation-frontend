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

const editRef = ref<InstanceType<typeof EditInfo>>();

const route = useRoute();
const buildingId = computed(() => route.params.buildingId as string);
const building = ref<BuildingDetails | null>();
const { call, isLoading } = useApiCall();

watch(() => buildingId.value, fetchBuilding, { immediate: true });
async function fetchBuilding() {
    const response = await call(() => apiClient.getBuildingsBuildingId({ params: { buildingId: buildingId.value } }));
    if (response.success) {
        building.value = response.data;
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
                availabilities: [{ dayOfWeek: 1, startTime: "08:00", endTime: "16:00" }],
            },
            { params: { buildingId: buildingId.value } },
        ),
    );

    if (response.success) {
        toastsStore.pushSuccess({ message: "Building updated successfully" });
    } else {
        toastsStore.pushError({
            title: "Failed to update building",
            message: response.error?.message ?? "An unknown error occurred",
        });
    }
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4">
            <EditHeader :name="building?.buildingInfo.name" :is-loading="isLoading" @save="handleSave" />
            <EditInfo ref="editRef" :building="building?.buildingInfo" :is-loading="isLoading" />
        </div>
    </AsideNavbarLayout>
</template>
