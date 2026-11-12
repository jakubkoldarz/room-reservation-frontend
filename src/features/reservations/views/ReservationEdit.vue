<script setup lang="ts">
import { useIntervalFn, useNow } from "@vueuse/core";
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { slotsForDate } from "@/features/availabilities/utils/schedule";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import { profileRoutes } from "@/features/profile/routes";
import type { RoomSummary } from "@/features/rooms/types";
import { parseIsoDate } from "@/features/rooms/utils/calendar";
import Container from "@/features/shared/Container.vue";
import FormHeader from "@/features/shared/FormHeader.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditReservation from "../components/EditReservation.vue";
import ReservationDayTimeline from "../components/ReservationDayTimeline.vue";
import type { ReservationListItem, ReservationTimeRange } from "../types";
import { formatReservationDate } from "../utils/reservationDetails";
import { isOwnReservation, ownReservationActions } from "../utils/reservationActions";
import { editTimeProblem, formatSlots } from "../utils/reservationEdit";
import { getReservationState } from "../utils/reservationState";

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();
const authStore = useAuthStore();
const { hasPermission } = usePermissions();
const form = useTemplateRef("form");
const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });

const reservationId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.params.reservationId);
    return parsed.success ? parsed.data : null;
});

const item = shallowRef<ReservationListItem | null>(null);
const room = shallowRef<RoomSummary | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const range = ref<ReservationTimeRange | null>(null);
const saveError = ref<string>();

function goBack() {
    return router.push({ name: profileRoutes.view.name, query: { tab: "reservations" } });
}

async function loadRoom(roomId: string): Promise<void> {
    if (!hasPermission(Permission.RoomView)) return;
    const result = await apiCall(() => apiClient.getRoomsRoomId({ params: { roomId } }));
    room.value = result.ok ? result.data : null;
}

async function load(id: string | null): Promise<void> {
    item.value = null;
    room.value = null;
    saveError.value = undefined;
    if (!id) {
        toasts.pushError({ title: "Reservation not found", message: "The link is not valid." });
        await goBack();
        return;
    }

    isLoading.value = true;
    const result = await apiCall(() =>
        apiClient.getReservationsReservationId({ params: { reservationId: id } }),
    );
    if (!result.ok) {
        isLoading.value = false;
        toasts.pushError({
            title: "Failed to load reservation",
            message: apiErrorMessage(result.error),
        });
        await goBack();
        return;
    }

    await loadRoom(result.data.roomInfo.id);
    item.value = result.data;
    isLoading.value = false;
}

watch(reservationId, load, { immediate: true });

const state = computed(() =>
    item.value
        ? getReservationState(item.value.reservationInfo, item.value.roomInfo.requiresApproval)
        : null,
);

const lockedReason = computed(() => {
    if (!item.value || !state.value) return null;
    if (!isOwnReservation(item.value.reservationInfo, authStore.user?.userInfo.id)) {
        return "You can change only your own reservations.";
    }
    if (state.value === "rejected" || state.value === "canceled") {
        return `This reservation was ${state.value}, so it can't be changed.`;
    }
    if (ownReservationActions(state.value, item.value.reservationInfo, now.value).length === 0) {
        return "This reservation has already started, so it can't be changed.";
    }
    return null;
});

const title = computed(() =>
    item.value
        ? `${item.value.roomInfo.identifier} · ${formatReservationDate(item.value.reservationInfo.date)}`
        : undefined,
);

const slots = computed(() => {
    const day = item.value ? parseIsoDate(item.value.reservationInfo.date) : null;
    if (!room.value || !day) return [];
    return slotsForDate(room.value.availabilities, day, room.value.events);
});

const busy = computed<ReservationTimeRange[]>(() => {
    if (!room.value || !item.value) return [];
    const info = item.value.reservationInfo;
    const requiresApproval = room.value.details.roomInfo.requiresApproval;
    return room.value.reservations
        .filter((other) => other.date === info.date && other.id !== info.id)
        .filter((other) => {
            const otherState = getReservationState(other, requiresApproval);
            return otherState === "approved" || otherState === "pending";
        })
        .map((other) => ({ startTime: other.startTime, endTime: other.endTime }));
});

const problem = computed(() => {
    if (!room.value || !item.value || !range.value || lockedReason.value) return null;
    return editTimeProblem({
        range: range.value,
        original: item.value.reservationInfo,
        date: item.value.reservationInfo.date,
        slots: slots.value,
        others: busy.value,
        now: now.value,
    });
});

const dayDescription = computed(() => {
    const hours =
        slots.value.length === 0
            ? "The room is closed on this day."
            : `Open ${formatSlots(slots.value)}.`;
    return lockedReason.value ? hours : `${hours} Choose a time that is open and not booked.`;
});

async function handleSave(): Promise<void> {
    const id = reservationId.value;
    const current = item.value;
    if (!id || !current || lockedReason.value) return;

    const values = await form.value?.submit();
    if (!values) return;
    if (problem.value) {
        toasts.pushError({ title: "This time can't be saved", message: problem.value });
        return;
    }

    isSaving.value = true;
    saveError.value = undefined;
    const result = await apiCall(() =>
        apiClient.putReservationsReservationId(
            {
                startTime: `${values.startTime}:00`,
                endTime: `${values.endTime}:00`,
                purpose: values.purpose || null,
            },
            { params: { reservationId: id } },
        ),
    );
    isSaving.value = false;

    if (!result.ok) {
        const error = result.error;
        if (error.kind === "validation") form.value?.showServerErrors(error.fieldErrors);
        if (error.kind === "http" && error.status === 409) {
            saveError.value = "Someone has just booked this time. The day view was refreshed.";
            await loadRoom(current.roomInfo.id);
        }
        toasts.pushError({
            title: "Failed to save reservation",
            message: apiErrorMessage(error),
        });
        return;
    }

    const waitsAgain =
        state.value === "approved" &&
        getReservationState(result.data, current.roomInfo.requiresApproval) === "pending";
    toasts.pushSuccess({
        title: "Reservation saved",
        message: waitsAgain
            ? "The new time is waiting for approval."
            : `Your reservation of ${current.roomInfo.identifier} was updated.`,
    });
    await goBack();
}
</script>

<template>
    <div class="flex flex-col gap-4 pb-20">
        <FormHeader
            :mode="lockedReason ? 'view' : 'edit'"
            :title
            :is-loading
            :is-saving
            @cancel="goBack"
            @save="handleSave"
        />

        <template v-if="item && state">
            <p
                v-if="lockedReason"
                class="border-border bg-surface text-text-muted rounded-lg border px-4 py-2 text-sm"
            >
                {{ lockedReason }}
            </p>

            <EditReservation
                ref="form"
                :key="item.reservationInfo.id"
                :item
                :state
                :readonly="!!lockedReason"
                @change="range = $event"
            />

            <Container v-if="room" class="flex flex-col gap-4">
                <div>
                    <div class="flex flex-wrap items-center gap-2">
                        <NumberCircle>2</NumberCircle>
                        <h2 class="text-lg font-semibold">
                            {{ item.roomInfo.identifier }} on
                            {{ formatReservationDate(item.reservationInfo.date) }}
                        </h2>
                    </div>
                    <p class="text-text-muted text-sm">{{ dayDescription }}</p>
                    <hr class="border-border mt-2" />
                </div>

                <ReservationDayTimeline
                    :slots
                    :busy
                    :original="item.reservationInfo"
                    :selection="range"
                    :invalid="!!problem"
                />

                <p v-if="problem || saveError" role="alert" class="text-danger text-sm">
                    {{ problem ?? saveError }}
                </p>
            </Container>
        </template>

        <template v-else-if="isLoading">
            <Container v-for="n in 2" :key="n" class="flex animate-pulse flex-col gap-3">
                <Skeleton class="w-1/3" />
                <Skeleton v-for="line in 4" :key="line" class="w-full" />
            </Container>
        </template>
    </div>
</template>
