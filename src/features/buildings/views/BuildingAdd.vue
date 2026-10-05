<script setup lang="ts">
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import CreateHeader from "../components/CreateHeader.vue";
import type { Building } from "../types";
import { ref } from "vue";
import EditInfo from "../components/EditInfo.vue";
import { useRouter } from "vue-router";
import { useApiCall } from "@/composables/useApiCall.ts";
import apiClient from "@/api/client.ts";
import { buildingRoutes } from "../routes.ts";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore.ts";
import AvailabilitiesEdit from "@/features/availabilities/components/AvailabilitiesEdit.vue";
import type { Availability } from "@/types/availabilities.ts";

const building = ref<Building>();
const availabilities = ref<Availability[]>([]);

const { call, isLoading } = useApiCall();
const router = useRouter();
const editRef = ref<InstanceType<typeof EditInfo> | null>(null);

async function handleSave() {
    const values = await editRef.value?.submit();
    if (!values) return;

    const toastsStore = useToastsStore();

    const response = await call(() => apiClient.postBuildings({ ...values, availabilities: availabilities.value }));
    if (response.success) {
        router.push({ name: buildingRoutes.view.name, params: { buildingId: response.data.id } });
        toastsStore.pushSuccess({ title: "Success", message: "Building created successfully" });
    } else {
        toastsStore.pushApiError({ title: "Failed to create building", error: response.error });
    }
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4 pb-20">
            <CreateHeader @save="handleSave" @cancel="router.back()" />
            <EditInfo ref="editRef" :building="building" is-new />
            <AvailabilitiesEdit v-model="availabilities" />
        </div>
    </AsideNavbarLayout>
</template>
