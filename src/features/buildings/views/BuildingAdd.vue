<script setup lang="ts">
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import FormHeader from "@/features/shared/FormHeader.vue";
import type { Building } from "../types";
import { ref } from "vue";
import EditInfo from "../components/EditInfo.vue";
import { useRouter } from "vue-router";
import { useBuildingDestination } from "../composables/useBuildingDestination";
import { apiCall } from "@/api/apiCall.ts";
import { apiErrorMessage } from "@/api/errors.ts";
import apiClient from "@/api/client.ts";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore.ts";
import AvailabilitiesEdit from "@/features/availabilities/components/AvailabilitiesEdit.vue";
import type { Availability } from "@/features/availabilities/types.ts";
import NumberCircle from "../components/NumberCircle.vue";

const building = ref<Building>();
const availabilities = ref<Availability[]>([]);

const isSaving = ref(false);
const router = useRouter();
const destinationFor = useBuildingDestination();
const editRef = ref<InstanceType<typeof EditInfo> | null>(null);

async function handleSave() {
    if (isSaving.value) return;
    const values = await editRef.value?.submit();
    if (!values) return;

    const toastsStore = useToastsStore();

    isSaving.value = true;
    const response = await apiCall(() =>
        apiClient.postBuildings({ ...values, availabilities: availabilities.value }),
    );
    isSaving.value = false;

    if (response.ok) {
        router.push(destinationFor(response.data.id));
        toastsStore.pushSuccess({ title: "Success", message: "Building created successfully" });
        return;
    }
    if (response.error.kind === "validation") {
        editRef.value?.showServerErrors(response.error.fieldErrors);
    }
    toastsStore.pushError({
        title: "Failed to create building",
        message: apiErrorMessage(response.error),
    });
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4 pb-20">
            <FormHeader mode="create" :is-saving @save="handleSave" @cancel="router.back()" />
            <EditInfo ref="editRef" :building="building" is-new />
            <AvailabilitiesEdit v-model="availabilities">
                <div class="flex items-center gap-2">
                    <NumberCircle>2</NumberCircle>
                    <h2 class="text-lg font-semibold">Building availabilities</h2>
                </div>
                <p class="text-text-muted text-sm">
                    Add the building's availabilities. Availabilities define the time slots when the
                    building is open for reservations.
                </p>
                <hr class="border-border my-2" />
            </AvailabilitiesEdit>
        </div>
    </AsideNavbarLayout>
</template>
