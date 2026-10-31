<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import type { Availability } from "@/features/availabilities/types";
import { useAllBuildings } from "@/features/buildings/composables/useAllBuildings";
import { useAllEquipment } from "@/features/equipment/composables/useAllEquipment";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import FormHeader from "@/features/shared/FormHeader.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditRoom from "../components/EditRoom.vue";
import { useRoomAvailabilityRules } from "../composables/useRoomAvailabilityRules";
import { useRoomDestination } from "../composables/useRoomDestination";
import EquipmentPicker from "../components/EquipmentPicker.vue";
import RoomAvailabilitiesEdit from "../components/RoomAvailabilitiesEdit.vue";
import { roomRoutes } from "../routes";
import { useRoomsStore } from "../stores/useRoomsStore";

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();
const roomsStore = useRoomsStore();
const { afterSave } = useRoomDestination();
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
const { building, isBuildingLoading, dayErrors, hints, emptyError, firstError } =
    useRoomAvailabilityRules(availabilities, selectedBuildingId);
const showAvailabilityErrors = ref(false);
const isSaving = ref(false);

function goToList() {
    return router.push({ name: roomRoutes.list.name });
}

async function handleSave(): Promise<void> {
    if (isSaving.value) return;
    const values = await form.value?.submit();
    showAvailabilityErrors.value = true;
    if (!values) return;
    if (firstError.value) {
        toasts.pushError({ title: "Invalid availabilities", message: firstError.value });
        return;
    }

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
        await router.push(afterSave(result.data.id));
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
            <RoomAvailabilitiesEdit
                v-model="availabilities"
                :building
                :is-building-loading
                :day-errors
                :hints
                :error="showAvailabilityErrors ? emptyError : undefined"
            >
                Add the room's availabilities. Availabilities define the time slots when the room is
                open for reservations.
            </RoomAvailabilitiesEdit>
        </div>
    </AsideNavbarLayout>
</template>
