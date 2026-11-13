<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage, type ApiError } from "@/api/errors";
import { useAllRooms } from "@/features/rooms/composables/useAllRooms";
import FormHeader from "@/features/shared/FormHeader.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditEvent from "../components/EditEvent.vue";
import EventRoomsPicker from "../components/EventRoomsPicker.vue";
import { useEventSave } from "../composables/useEventSave";
import { eventRoutes } from "../routes";
import type { EventForm, EventSaveOutcome } from "../types";
import { overlapMessage, toEventRequest } from "../utils/eventConflicts";

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();
const form = useTemplateRef("form");

const { rooms, isLoading: isRoomsLoading } = useAllRooms();

const roomIds = ref<string[]>([]);
const roomsError = ref<string>();

const uuid = z.string().uuid();
const preselectedRoomId = uuid.safeParse(route.query.roomId).data;
const preselectedBuildingId = uuid.safeParse(route.query.buildingId).data;

watch(
    rooms,
    (list, previous) => {
        const wasEmptyBefore = previous === undefined || previous.length === 0;
        const roomsJustLoaded = list.length > 0 && wasEmptyBefore;
        const nothingSelectedYet = roomIds.value.length === 0;
        if (!roomsJustLoaded || !nothingSelectedYet) return;

        const preselected: string[] = [];
        for (const room of list) {
            const isPreselectedRoom = room.roomInfo.id === preselectedRoomId;
            const isInPreselectedBuilding = room.buildingInfo.id === preselectedBuildingId;
            if (isPreselectedRoom || isInPreselectedBuilding) {
                preselected.push(room.roomInfo.id);
            }
        }
        roomIds.value = preselected;
    },
    { immediate: true },
);

const roomNames = computed(() => {
    const names = new Map<string, string>();
    for (const room of rooms.value) {
        names.set(room.roomInfo.id, room.roomInfo.identifier);
    }
    return names;
});
const { save, isSaving } = useEventSave(() => roomNames.value);

function goToList() {
    return router.push({ name: eventRoutes.list.name });
}

function showValidationErrors(error: ApiError): void {
    if (error.kind !== "validation") return;

    if (form.value) form.value.showServerErrors(error.fieldErrors);
    const roomErrors = error.fieldErrors.roomIds;
    if (roomErrors) roomsError.value = roomErrors[0];
}

async function showOutcome(outcome: EventSaveOutcome): Promise<void> {
    if (outcome.kind === "saved") {
        toasts.pushSuccess({
            title: "Event created",
            message: `"${outcome.event.name}" was created.`,
        });
        await goToList();
    } else if (outcome.kind === "overlap") {
        roomsError.value = overlapMessage(outcome.events);
        toasts.pushError({
            title: "Events overlap",
            message: "A room can have only one event on a given day.",
        });
    } else if (outcome.kind === "failed") {
        showValidationErrors(outcome.error);
        toasts.pushError({
            title: "Failed to create event",
            message: apiErrorMessage(outcome.error),
        });
    }
}

function checkRoomsSelected(): boolean {
    if (roomIds.value.length === 0) {
        roomsError.value = "Select at least one room";
        return false;
    }
    roomsError.value = undefined;
    return true;
}

async function createEvent(values: EventForm, force: boolean) {
    const request = toEventRequest(values, roomIds.value);
    return await apiCall(() => apiClient.postEvents(request, { queries: { force } }));
}

async function handleSave(): Promise<void> {
    if (!form.value) return;

    const values = await form.value.submit();
    const hasRooms = checkRoomsSelected();
    if (!values || !hasRooms) return;

    const eventForm: EventForm = values;

    async function send(force: boolean) {
        return await createEvent(eventForm, force);
    }

    const outcome = await save(send, "Create event anyway?", "Create anyway");
    await showOutcome(outcome);
}
</script>

<template>
    <div class="flex flex-col gap-4 pb-20">
        <FormHeader
            mode="create"
            title="New event"
            :is-saving
            @cancel="goToList"
            @save="handleSave"
        />
        <EditEvent ref="form" />
        <EventRoomsPicker
            v-model="roomIds"
            :rooms
            :is-loading="isRoomsLoading"
            :error="roomsError"
        />
    </div>
</template>
