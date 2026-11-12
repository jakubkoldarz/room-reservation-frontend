<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { useRoute } from "vue-router";
import { useIntervalFn, useNow } from "@vueuse/core";
import { PlusIcon } from "@heroicons/vue/24/solid";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { slotsForDate } from "@/features/availabilities/utils/schedule";
import ReservationCreateDialog from "@/features/reservations/components/ReservationCreateDialog.vue";
import { useOwnReservationActions } from "@/features/reservations/composables/useOwnReservationActions";
import type { ReservationDraft, ReservationRoom } from "@/features/reservations/types";
import {
    isOwnReservation,
    ownReservationActions,
} from "@/features/reservations/utils/reservationActions";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import { toIsoDate } from "@/utils/isoDate";
import RoomCalendar from "../components/RoomCalendar.vue";
import RoomInfoPanel from "../components/RoomInfoPanel.vue";
import { useCalendarWeek } from "../composables/useCalendarWeek";
import type { CalendarBlock, CalendarSelection, RoomSummary } from "../types";
import { buildCalendarDays, hourRange, minutesToHm } from "../utils/calendar";

const route = useRoute();
const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });

const roomId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.params.roomId);
    return parsed.success ? parsed.data : null;
});

const room = shallowRef<RoomSummary | null>(null);
const loadError = ref<string | null>(null);
const isLoading = ref(false);

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

    if (result.ok) {
        room.value = result.data;
    } else {
        loadError.value = apiErrorMessage(result.error);
    }
}

watch(roomId, load, { immediate: true });

async function refresh(): Promise<void> {
    const id = roomId.value;
    if (!id) return;
    const result = await apiCall(() => apiClient.getRoomsRoomId({ params: { roomId: id } }));
    if (result.ok && id === roomId.value) room.value = result.data;
}

const { weekStart, isCurrentWeek, weekLabel, showPreviousWeek, showNextWeek, showCurrentWeek } =
    useCalendarWeek(now);

const reservationRoom = computed<ReservationRoom>(() => ({
    name: room.value?.details.roomInfo.identifier ?? "",
    building: room.value?.details.buildingInfo.name ?? "",
}));

const days = computed(() =>
    buildCalendarDays({
        weekStart: weekStart.value,
        now: now.value,
        reservations: room.value?.reservations ?? [],
        events: room.value?.events ?? [],
        availabilities: room.value?.availabilities ?? [],
        requiresApproval: room.value?.details.roomInfo.requiresApproval ?? false,
        roomOf: () => reservationRoom.value,
    }),
);

const authStore = useAuthStore();
const { withdraw, cancel } = useOwnReservationActions();

function blockActions(block: CalendarBlock) {
    if (!isOwnReservation(block.reservation, authStore.user?.userInfo.id)) return [];
    return ownReservationActions(block.kind, block.reservation, now.value);
}

async function onWithdraw(block: CalendarBlock): Promise<void> {
    if (await withdraw(block.reservation, reservationRoom.value.name)) await refresh();
}

async function onCancel(block: CalendarBlock): Promise<void> {
    if (await cancel(block.reservation, reservationRoom.value.name)) await refresh();
}
const hours = computed(() => hourRange(room.value?.availabilities ?? [], days.value));

const { hasPermission } = usePermissions();
const canReserve = computed(
    () => hasPermission(Permission.ReservationCreate) && room.value !== null,
);

const selection = ref<CalendarSelection | null>(null);
const draft = ref<ReservationDraft | null>(null);
const isDialogOpen = ref(false);

function openDialog(next: ReservationDraft): void {
    draft.value = next;
    isDialogOpen.value = true;
}

function onSelect(next: CalendarSelection): void {
    selection.value = next;
    openDialog({
        date: next.iso,
        startTime: minutesToHm(next.start),
        endTime: minutesToHm(next.end),
    });
}

function defaultDraft(): ReservationDraft {
    const date = isCurrentWeek.value ? new Date(now.value) : new Date(weekStart.value);
    const isToday = toIsoDate(date) === toIsoDate(now.value);
    const firstSlot = slotsForDate(
        room.value?.availabilities ?? [],
        date,
        room.value?.events ?? [],
    )[0];
    const openingHour = firstSlot ? Number(firstSlot.startTime.split(":")[0]) : 8;
    const startHour = Math.min(
        isToday ? Math.max(now.value.getHours() + 1, openingHour) : openingHour,
        22,
    );
    return {
        date: toIsoDate(date),
        startTime: minutesToHm(startHour * 60),
        endTime: minutesToHm((startHour + 1) * 60),
    };
}

function openNewReservation(): void {
    selection.value = null;
    openDialog(defaultDraft());
}

function closeDialog(): void {
    isDialogOpen.value = false;
    selection.value = null;
}

async function onCreated(): Promise<void> {
    closeDialog();
    await refresh();
}
</script>

<template>
    <div class="@container">
        <ErrorText v-if="loadError" :error="loadError" />
        <div v-else class="flex flex-col gap-4 @5xl:flex-row @5xl:items-start">
            <RoomInfoPanel
                :room
                :now
                :is-loading
                class="@5xl:sticky @5xl:top-4 @5xl:order-2 @5xl:w-80 @5xl:shrink-0"
            />
            <RoomCalendar
                :days
                :hours
                :now
                :week-label
                :is-current-week
                :is-loading
                :selectable="canReserve"
                :selection
                :block-actions="blockActions"
                class="min-w-0 flex-1 @5xl:order-1"
                @previous="showPreviousWeek"
                @next="showNextWeek"
                @today="showCurrentWeek"
                @select="onSelect"
                @withdraw="onWithdraw"
                @cancel="onCancel"
            >
                <template #actions>
                    <BaseTooltip v-if="canReserve" text="New reservation" class="@3xl:hidden">
                        <button
                            type="button"
                            aria-label="New reservation"
                            class="bg-primary text-surface hover:bg-primary-hover focus-visible:ring-primary grid size-8 cursor-pointer place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
                            @click="openNewReservation"
                        >
                            <PlusIcon class="size-5" />
                        </button>
                    </BaseTooltip>
                </template>
            </RoomCalendar>
        </div>
    </div>
    <ReservationCreateDialog
        v-if="room"
        :open="isDialogOpen"
        :room-id="room.details.roomInfo.id"
        :room="reservationRoom"
        :requires-approval="room.details.roomInfo.requiresApproval"
        :draft
        :availabilities="room.availabilities"
        :events="room.events"
        @close="closeDialog"
        @created="onCreated"
        @conflict="refresh"
    />
</template>
