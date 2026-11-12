<script setup lang="ts">
import { computed, ref, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { useAllRooms } from "@/features/rooms/composables/useAllRooms";
import FormHeader from "@/features/shared/FormHeader.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditEvent from "../components/EditEvent.vue";
import EventRoomsPicker from "../components/EventRoomsPicker.vue";
import { useEventSave } from "../composables/useEventSave";
import { eventRoutes } from "../routes";
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
        if (list.length === 0 || (previous?.length ?? 0) > 0 || roomIds.value.length > 0) return;
        roomIds.value = list
            .filter(
                (room) =>
                    room.roomInfo.id === preselectedRoomId ||
                    room.buildingInfo.id === preselectedBuildingId,
            )
            .map((room) => room.roomInfo.id);
    },
    { immediate: true },
);

const roomNames = computed(
    () => new Map(rooms.value.map((room) => [room.roomInfo.id, room.roomInfo.identifier])),
);
const { save, isSaving } = useEventSave(() => roomNames.value);

function goToList() {
    return router.push({ name: eventRoutes.list.name });
}

async function handleSave(): Promise<void> {
    const values = await form.value?.submit();
    roomsError.value = roomIds.value.length === 0 ? "Select at least one room" : undefined;
    if (!values || roomsError.value) return;

    const outcome = await save(
        (force) =>
            apiCall(() =>
                apiClient.postEvents(toEventRequest(values, roomIds.value), { queries: { force } }),
            ),
        "Create event anyway?",
        "Create anyway",
    );

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
        if (outcome.error.kind === "validation") {
            form.value?.showServerErrors(outcome.error.fieldErrors);
            roomsError.value = outcome.error.fieldErrors.roomIds?.[0];
        }
        toasts.pushError({
            title: "Failed to create event",
            message: apiErrorMessage(outcome.error),
        });
    }
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
