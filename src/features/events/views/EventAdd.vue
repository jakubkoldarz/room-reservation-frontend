<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import { useAllRooms } from "@/features/rooms/composables/useAllRooms";
import {
    reservationConflicts,
    reservationsAffectedMessage,
} from "@/features/rooms/utils/conflicts";
import FormHeader from "@/features/shared/FormHeader.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditEvent from "../components/EditEvent.vue";
import EventRoomsPicker from "../components/EventRoomsPicker.vue";
import { eventRoutes } from "../routes";
import type { EventForm } from "../types";
import { eventConflicts, toEventRequest } from "../utils/eventConflicts";
import { formatEventDates } from "../utils/eventFormat";

const router = useRouter();
const toasts = useToastsStore();
const confirm = useConfirm();
const form = useTemplateRef("form");

const { rooms, isLoading: isRoomsLoading } = useAllRooms();

const roomIds = ref<string[]>([]);
const roomsError = ref<string>();
const isSaving = ref(false);

const roomNames = computed(
    () => new Map(rooms.value.map((room) => [room.roomInfo.id, room.roomInfo.identifier])),
);

function goToList() {
    return router.push({ name: eventRoutes.list.name });
}

function create(values: EventForm, force: boolean) {
    return apiCall(() =>
        apiClient.postEvents(toEventRequest(values, roomIds.value), { queries: { force } }),
    );
}

function affectedRooms(ids: string[]): string {
    const names = [...new Set(ids)].map((id) => roomNames.value.get(id) ?? "unknown room");
    return names.join(", ");
}

async function handleSave(): Promise<void> {
    if (isSaving.value) return;
    const values = await form.value?.submit();
    roomsError.value = roomIds.value.length === 0 ? "Select at least one room" : undefined;
    if (!values || roomsError.value) return;

    isSaving.value = true;
    let result = await create(values, false);

    if (!result.ok) {
        const reservations = reservationConflicts(result.error);
        if (reservations.length > 0) {
            isSaving.value = false;
            const confirmed = await confirm({
                title: "Create event anyway?",
                message: `${reservationsAffectedMessage(reservations.length)} Affected rooms: ${affectedRooms(reservations.map((r) => r.roomId))}.`,
                confirmText: "Create anyway",
                danger: true,
            });
            if (!confirmed) return;
            isSaving.value = true;
            result = await create(values, true);
        }
    }
    isSaving.value = false;

    if (result.ok) {
        toasts.pushSuccess({
            title: "Event created",
            message: `"${result.data.name}" was created.`,
        });
        await goToList();
        return;
    }

    const overlapping = eventConflicts(result.error);
    if (overlapping.length > 0) {
        roomsError.value = `Some rooms already have an event on these days: ${overlapping
            .map((event) => `${event.name} (${formatEventDates(event)})`)
            .join(", ")}.`;
        toasts.pushError({
            title: "Events overlap",
            message: "A room can have only one event on a given day.",
        });
        return;
    }
    if (result.error.kind === "validation") {
        form.value?.showServerErrors(result.error.fieldErrors);
        roomsError.value = result.error.fieldErrors.roomIds?.[0];
    }
    toasts.pushError({ title: "Failed to create event", message: apiErrorMessage(result.error) });
}
</script>

<template>
    <AsideNavbarLayout>
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
    </AsideNavbarLayout>
</template>
