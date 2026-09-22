<script setup lang="ts">
import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import Badge from "@/features/shared/Badge.vue";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import LoadingPanel from "@/features/shared/LoadingPanel.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import type { BuildingDetails } from "@/types/dtos";
import { BuildingOfficeIcon, MapPinIcon, PencilSquareIcon, PlusIcon } from "@heroicons/vue/24/solid";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

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
        <LoadingPanel v-if="isLoading" />
        <Container v-else class="w-full flex flex-col justify-start">
            <h1 class="text-lg sm:text-xl font-bold">Wydział Elektroniki i Informatyki</h1>
            <Badge
                v-if="building?.buildingInfo.identifier"
                class="self-start mt-1"
                :text="building.buildingInfo.identifier"
            />
            <div class="flex flex-wrap gap-2 mt-4">
                <p class="text-sm flex items-center gap-1"><MapPinIcon class="size-5" /> {{ localization }}</p>
                <p class="text-sm flex items-center gap-1">
                    <BuildingOfficeIcon class="size-5" />Floors count: <b>{{ building?.buildingInfo.floorsCount }}</b>
                </p>
            </div>
            <div class="flex flex-wrap mt-4 gap-2">
                <OutlineButton class="py-1 rounded-lg">
                    <PencilSquareIcon class="size-5" /> Edit Building
                </OutlineButton>
                <BaseButton class="py-1 rounded-lg"> <PlusIcon class="size-5" /> Add Room </BaseButton>
            </div>
        </Container>
    </AsideNavbarLayout>
</template>
