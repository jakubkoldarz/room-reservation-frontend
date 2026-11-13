<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage, type ApiError } from "@/api/errors";
import { useAllRooms } from "@/features/rooms/composables/useAllRooms";
import Container from "@/features/shared/Container.vue";
import FormHeader from "@/features/shared/FormHeader.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { toIsoDate } from "@/utils/isoDate";
import EditEvent from "../components/EditEvent.vue";
import EventRoomsPicker from "../components/EventRoomsPicker.vue";
import { useEventSave } from "../composables/useEventSave";
import { eventRoutes } from "../routes";
import type { EventForm, EventInfo, EventSaveOutcome } from "../types";
import { overlapMessage, toEventRequest } from "../utils/eventConflicts";
import { eventPeriod } from "../utils/eventFormat";

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();
const form = useTemplateRef("form");

const { rooms, isLoading: isRoomsLoading } = useAllRooms();

const eventId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.params.eventId);
    return parsed.success ? parsed.data : null;
});

const event = shallowRef<EventInfo | null>(null);
const isLoading = ref(false);
const roomIds = ref<string[]>([]);
const roomsError = ref<string>();

const isPast = computed(
    () => !!event.value && eventPeriod(event.value, toIsoDate(new Date())) === "past",
);

const roomNames = computed(() => {
    const names = new Map<string, string>();
    if (event.value) {
        for (const room of event.value.rooms) {
            names.set(room.id, room.identifier);
        }
    }
    for (const room of rooms.value) {
        names.set(room.roomInfo.id, room.roomInfo.identifier);
    }
    return names;
});
const { save, isSaving } = useEventSave(() => roomNames.value);

function goToList() {
    return router.push({ name: eventRoutes.list.name });
}

async function load(id: string | null): Promise<void> {
    event.value = null;
    if (!id) {
        toasts.pushError({ title: "Event not found", message: "The link is not valid." });
        await goToList();
        return;
    }

    isLoading.value = true;
    const result = await apiCall(() => apiClient.getEventsEventId({ params: { eventId: id } }));
    isLoading.value = false;

    if (!result.ok) {
        toasts.pushError({
            title: "Failed to load event",
            message: apiErrorMessage(result.error),
        });
        await goToList();
        return;
    }
    event.value = result.data;
    roomIds.value = result.data.rooms.map((room) => room.id);
}

watch(eventId, load, { immediate: true });

function showValidationErrors(error: ApiError): void {
    if (error.kind !== "validation") return;

    if (form.value) form.value.showServerErrors(error.fieldErrors);
    const roomErrors = error.fieldErrors.roomIds;
    if (roomErrors) roomsError.value = roomErrors[0];
}

async function showOutcome(outcome: EventSaveOutcome): Promise<void> {
    if (outcome.kind === "saved") {
        toasts.pushSuccess({
            title: "Event saved",
            message: `"${outcome.event.name}" was updated.`,
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
            title: "Failed to save event",
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

async function updateEvent(id: string, values: EventForm, force: boolean) {
    const request = toEventRequest(values, roomIds.value);
    return await apiCall(() =>
        apiClient.putEventsEventId(request, { params: { eventId: id }, queries: { force } }),
    );
}

async function handleSave(): Promise<void> {
    const id = eventId.value;
    if (!id || !form.value) return;

    const values = await form.value.submit();
    const hasRooms = checkRoomsSelected();
    if (!values || !hasRooms) return;

    const savedEventId: string = id;
    const eventForm: EventForm = values;

    async function send(force: boolean) {
        return await updateEvent(savedEventId, eventForm, force);
    }

    const outcome = await save(send, "Save changes anyway?", "Save anyway");
    await showOutcome(outcome);
}
</script>

<template>
    <div class="flex flex-col gap-4 pb-20">
        <FormHeader
            :mode="isPast ? 'view' : 'edit'"
            :title="event?.name"
            :is-loading
            :is-saving
            @cancel="goToList"
            @save="handleSave"
        />
        <template v-if="event">
            <p
                v-if="isPast"
                class="border-border bg-surface text-text-muted rounded-lg border px-4 py-2 text-sm"
            >
                This event has already ended, so it can't be changed.
            </p>
            <EditEvent ref="form" :key="event.id" :event :readonly="isPast" />
            <EventRoomsPicker
                v-model="roomIds"
                :rooms
                :is-loading="isRoomsLoading"
                :error="roomsError"
                :readonly="isPast"
            />
        </template>
        <template v-else-if="isLoading">
            <Container v-for="n in 2" :key="n" class="flex animate-pulse flex-col gap-3">
                <Skeleton class="w-1/3" />
                <Skeleton v-for="line in 4" :key="line" class="w-full" />
            </Container>
        </template>
    </div>
</template>
