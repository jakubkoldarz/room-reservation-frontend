<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
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
import type { EventInfo } from "../types";
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

const roomNames = computed(
    () =>
        new Map([
            ...(event.value?.rooms ?? []).map((room) => [room.id, room.identifier] as const),
            ...rooms.value.map((room) => [room.roomInfo.id, room.roomInfo.identifier] as const),
        ]),
);
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

async function handleSave(): Promise<void> {
    const id = eventId.value;
    const values = await form.value?.submit();
    roomsError.value = roomIds.value.length === 0 ? "Select at least one room" : undefined;
    if (!id || !values || roomsError.value) return;

    const outcome = await save(
        (force) =>
            apiCall(() =>
                apiClient.putEventsEventId(toEventRequest(values, roomIds.value), {
                    params: { eventId: id },
                    queries: { force },
                }),
            ),
        "Save changes anyway?",
        "Save anyway",
    );

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
        if (outcome.error.kind === "validation") {
            form.value?.showServerErrors(outcome.error.fieldErrors);
            roomsError.value = outcome.error.fieldErrors.roomIds?.[0];
        }
        toasts.pushError({
            title: "Failed to save event",
            message: apiErrorMessage(outcome.error),
        });
    }
}
</script>

<template>
    <AsideNavbarLayout>
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
    </AsideNavbarLayout>
</template>
