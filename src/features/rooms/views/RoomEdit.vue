<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import type { Availability } from "@/features/availabilities/types";
import { useAllBuildings } from "@/features/buildings/composables/useAllBuildings";
import { useAllEquipment } from "@/features/equipment/composables/useAllEquipment";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import ErrorText from "@/features/shared/ErrorText.vue";
import FormHeader from "@/features/shared/FormHeader.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditRoom from "../components/EditRoom.vue";
import { useRoomAvailabilityRules } from "../composables/useRoomAvailabilityRules";
import { useRoomDestination } from "../composables/useRoomDestination";
import EquipmentPicker from "../components/EquipmentPicker.vue";
import RoomAvailabilitiesEdit from "../components/RoomAvailabilitiesEdit.vue";
import { roomRoutes } from "../routes";
import { useRoomsStore } from "../stores/useRoomsStore";
import type { ConflictingReservation, RoomForm, RoomSummary } from "../types";
import { reservationConflicts, reservationsAffectedMessage } from "../utils/conflicts";

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();
const confirm = useConfirm();
const roomsStore = useRoomsStore();
const { afterSave } = useRoomDestination();
const form = useTemplateRef("form");

const { buildings } = useAllBuildings();
const { equipment: allEquipment, isLoading: isEquipmentLoading } = useAllEquipment();

const roomId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.params.roomId);
    return parsed.success ? parsed.data : null;
});

const room = shallowRef<RoomSummary | null>(null);
const loadError = ref<string | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);

const selectedBuildingId = ref("");
const equipmentIds = ref<string[]>([]);
const equipmentError = ref<string>();
const availabilities = ref<Availability[]>([]);
const { building, isBuildingLoading, dayErrors, hints, emptyError, firstError } =
    useRoomAvailabilityRules(availabilities, selectedBuildingId);
const showAvailabilityErrors = ref(false);

const equipment = computed(() => {
    const assigned = room.value?.details.equipment ?? [];
    const missing = assigned.filter((item) => !allEquipment.value.some((e) => e.id === item.id));
    return [...missing, ...allEquipment.value];
});

async function load(id: string | null): Promise<void> {
    room.value = null;
    loadError.value = null;
    if (!id) {
        loadError.value = "Room not found.";
        return;
    }

    isLoading.value = true;
    const result = await apiCall(() => apiClient.getRoomsRoomId({ params: { roomId: id } }));
    isLoading.value = false;

    if (!result.ok) {
        loadError.value = apiErrorMessage(result.error);
        return;
    }
    room.value = result.data;
    equipmentIds.value = result.data.details.equipment.map((item) => item.id);
    availabilities.value = result.data.availabilities.map(({ dayOfWeek, startTime, endTime }) => ({
        dayOfWeek,
        startTime,
        endTime,
    }));
}

watch(roomId, load, { immediate: true });

function goBack() {
    return router.push(roomId.value ? afterSave(roomId.value) : { name: roomRoutes.list.name });
}

function update(id: string, values: RoomForm, force: boolean) {
    return apiCall(() =>
        apiClient.putRoomsRoomId(
            { ...values, equipmentIds: equipmentIds.value, availabilities: availabilities.value },
            { params: { roomId: id }, queries: { force } },
        ),
    );
}

function confirmForce(conflicts: readonly ConflictingReservation[]): Promise<boolean> {
    return confirm({
        title: "Save changes anyway?",
        message: `The new opening hours do not cover some upcoming reservations. ${reservationsAffectedMessage(conflicts.length)}`,
        confirmText: "Save anyway",
        danger: true,
    });
}

async function handleSave(): Promise<void> {
    const id = roomId.value;
    if (!id || isSaving.value) return;
    const values = await form.value?.submit();
    showAvailabilityErrors.value = true;
    if (!values) return;
    if (firstError.value) {
        toasts.pushError({ title: "Invalid availabilities", message: firstError.value });
        return;
    }

    isSaving.value = true;
    equipmentError.value = undefined;
    let result = await update(id, values, false);
    const conflicts = result.ok ? [] : reservationConflicts(result.error);
    if (conflicts.length > 0) {
        isSaving.value = false;
        if (!(await confirmForce(conflicts))) return;
        isSaving.value = true;
        result = await update(id, values, true);
    }
    isSaving.value = false;

    if (result.ok) {
        toasts.pushSuccess({
            title: "Success",
            message: `Room "${result.data.identifier}" updated`,
        });
        roomsStore.fetchRooms();
        await goBack();
        return;
    }
    if (result.error.kind === "validation") {
        form.value?.showServerErrors(result.error.fieldErrors);
        equipmentError.value = result.error.fieldErrors.equipmentIds?.[0];
    }
    toasts.pushError({
        title: "Failed to update room",
        message: apiErrorMessage(result.error),
    });
}
</script>

<template>
    <AsideNavbarLayout>
        <div class="flex flex-col gap-4 pb-20">
            <ErrorText v-if="loadError" :error="loadError" />
            <template v-else>
                <FormHeader
                    mode="edit"
                    :title="room?.details.roomInfo.identifier"
                    :is-loading
                    :is-saving
                    @cancel="goBack"
                    @save="handleSave"
                />
                <EditRoom
                    ref="form"
                    :buildings
                    :room="room?.details ?? null"
                    :is-loading
                    @building-change="(id) => (selectedBuildingId = id)"
                >
                    Edit details of the room. Please fill in all required fields.
                </EditRoom>
                <EquipmentPicker
                    v-model="equipmentIds"
                    :equipment
                    :is-loading="isLoading || isEquipmentLoading"
                    :error="equipmentError"
                />
                <RoomAvailabilitiesEdit
                    v-model="availabilities"
                    :building
                    :is-loading
                    :is-building-loading
                    :day-errors
                    :hints
                    :error="showAvailabilityErrors ? emptyError : undefined"
                >
                    Edit the room's availabilities. Availabilities define the time slots when the
                    room is open for reservations.
                </RoomAvailabilitiesEdit>
            </template>
        </div>
    </AsideNavbarLayout>
</template>
