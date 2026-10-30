<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import { DocumentDuplicateIcon } from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import AvailabilitiesEdit from "@/features/availabilities/components/AvailabilitiesEdit.vue";
import type { Availability } from "@/features/availabilities/types";
import FormHeader from "@/features/shared/FormHeader.vue";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import { useAllBuildings } from "@/features/buildings/composables/useAllBuildings";
import { useAllEquipment } from "@/features/equipment/composables/useAllEquipment";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditRoom from "../components/EditRoom.vue";
import EquipmentPicker from "../components/EquipmentPicker.vue";
import { roomRoutes } from "../routes";
import { useRoomsStore } from "../stores/useRoomsStore";

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();
const roomsStore = useRoomsStore();
const form = useTemplateRef("form");

const { buildings } = useAllBuildings();
const { equipment, isLoading: isEquipmentLoading } = useAllEquipment();

const defaultBuildingId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.query.buildingId);
    return parsed.success ? parsed.data : undefined;
});

const selectedBuildingId = ref("");
const equipmentIds = ref<string[]>([]);
const equipmentError = ref<string>();
const availabilities = ref<Availability[]>([]);
const isSaving = ref(false);
const isCopying = ref(false);

function goToList() {
    return router.push({ name: roomRoutes.list.name });
}

async function copyBuildingAvailabilities(): Promise<void> {
    const buildingId = selectedBuildingId.value;
    if (!buildingId || isCopying.value) return;

    isCopying.value = true;
    const result = await apiCall(() =>
        apiClient.getBuildingsBuildingId({ params: { buildingId } }),
    );
    isCopying.value = false;

    if (!result.ok) {
        toasts.pushError({
            title: "Failed to copy availabilities",
            message: apiErrorMessage(result.error),
        });
        return;
    }
    availabilities.value = result.data.availabilities.map(({ dayOfWeek, startTime, endTime }) => ({
        dayOfWeek,
        startTime,
        endTime,
    }));
    toasts.pushInfo({
        title: "Availabilities copied",
        message: `Copied from "${result.data.buildingInfo.name}"`,
    });
}

async function handleSave(): Promise<void> {
    if (isSaving.value) return;
    const values = await form.value?.submit();
    if (!values) return;

    isSaving.value = true;
    equipmentError.value = undefined;
    const result = await apiCall(() =>
        apiClient.postRooms({
            ...values,
            equipmentIds: equipmentIds.value,
            availabilities: availabilities.value,
        }),
    );
    isSaving.value = false;

    if (result.ok) {
        toasts.pushSuccess({
            title: "Success",
            message: `Room "${result.data.identifier}" created`,
        });
        roomsStore.fetchRooms();
        await goToList();
        return;
    }
    if (result.error.kind === "validation") {
        form.value?.showServerErrors(result.error.fieldErrors);
        equipmentError.value = result.error.fieldErrors.equipmentIds?.[0];
    }
    toasts.pushError({
        title: "Failed to create room",
        message: apiErrorMessage(result.error),
    });
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4 pb-20">
            <FormHeader mode="create" :is-saving @cancel="goToList" @save="handleSave" />
            <EditRoom
                ref="form"
                :buildings
                :default-building-id="defaultBuildingId"
                @building-change="(id) => (selectedBuildingId = id)"
            >
                Set details of the room. Please fill in all required fields.
            </EditRoom>
            <EquipmentPicker
                v-model="equipmentIds"
                :equipment
                :is-loading="isEquipmentLoading"
                :error="equipmentError"
            />
            <AvailabilitiesEdit v-model="availabilities">
                <div class="flex flex-wrap items-center gap-2">
                    <NumberCircle>3</NumberCircle>
                    <h2 class="text-lg font-semibold">Room availabilities</h2>
                    <span class="grow"></span>
                    <OutlineButton
                        :disabled="!selectedBuildingId"
                        :is-loading="isCopying"
                        class="border-primary/30! text-primary! hover:bg-primary/10! w-full justify-center rounded-lg py-1 disabled:cursor-not-allowed disabled:opacity-50! disabled:hover:bg-transparent! @sm:w-auto"
                        @click="copyBuildingAvailabilities"
                    >
                        <DocumentDuplicateIcon v-if="!isCopying" class="size-4" />
                        Copy from building
                    </OutlineButton>
                </div>
                <p class="text-text-muted text-sm">
                    Add the room's availabilities. Availabilities define the time slots when the
                    room is open for reservations.
                </p>
                <hr class="border-border my-2" />
            </AvailabilitiesEdit>
        </div>
    </AsideNavbarLayout>
</template>
