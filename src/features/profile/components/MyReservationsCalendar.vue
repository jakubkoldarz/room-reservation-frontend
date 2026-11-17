<script setup lang="ts">
import { useIntervalFn, useLocalStorage, useNow } from "@vueuse/core";
import { computed } from "vue";
import { useMyReservations } from "@/features/reservations/composables/useMyReservations";
import { useOwnReservationActions } from "@/features/reservations/composables/useOwnReservationActions";
import type { Reservation, ReservationRoom } from "@/features/reservations/types";
import { ownReservationActions } from "@/features/reservations/utils/reservationActions";
import { getReservationState } from "@/features/reservations/utils/reservationState";
import RoomCalendar from "@/features/rooms/components/RoomCalendar.vue";
import { useCalendarWeek } from "@/features/rooms/composables/useCalendarWeek";
import type { CalendarBlock, CalendarBlockKind } from "@/features/rooms/types";
import { buildCalendarDays, hourRange } from "@/features/rooms/utils/calendar";
import { PERSONAL_LEGEND_KINDS } from "@/features/rooms/utils/calendarStyles";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import SlidingCheckbox from "@/features/shared/SlidingCheckbox.vue";

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });
const { weekStart, isCurrentWeek, weekLabel, showPreviousWeek, showNextWeek, showCurrentWeek } =
    useCalendarWeek(now);

const { items, isLoading, error, reload } = useMyReservations(weekStart);
const { withdraw, cancel } = useOwnReservationActions();

const UNKNOWN_ROOM: ReservationRoom = { name: "Unknown room", building: "" };

const reservationRooms = computed(
    () =>
        new Map<string, ReservationRoom>(
            items.value.map((item) => [
                item.reservationInfo.id,
                { name: item.roomInfo.identifier, building: item.buildingInfo.name },
            ]),
        ),
);

function roomOf(reservation: Reservation): ReservationRoom {
    return reservationRooms.value.get(reservation.id) ?? UNKNOWN_ROOM;
}

const ACTIVE_LEGEND_KINDS: readonly CalendarBlockKind[] = ["approved", "pending"];

const showActiveOnly = useLocalStorage("my-reservations-calendar-active-only", false);

const legendKinds = computed(() => {
    if (showActiveOnly.value) return ACTIVE_LEGEND_KINDS;
    return PERSONAL_LEGEND_KINDS;
});

function isActive(reservation: Reservation): boolean {
    const state = getReservationState(reservation, false);
    return state === "approved" || state === "pending";
}

const visibleReservations = computed(() => {
    const reservations: Reservation[] = [];
    for (const item of items.value) {
        if (showActiveOnly.value && !isActive(item.reservationInfo)) continue;
        reservations.push(item.reservationInfo);
    }
    return reservations;
});

const days = computed(() =>
    buildCalendarDays({
        weekStart: weekStart.value,
        now: now.value,
        reservations: visibleReservations.value,
        events: [],
        availabilities: [],
        requiresApproval: false,
        reservationTitle: (reservation) => roomOf(reservation).name,
        roomOf,
    }),
);
const hours = computed(() => hourRange([], days.value));

function blockActions(block: CalendarBlock) {
    return ownReservationActions(block.kind, block.reservation, now.value);
}

async function onWithdraw(block: CalendarBlock): Promise<void> {
    if (await withdraw(block.reservation, roomOf(block.reservation).name)) await reload();
}

async function onCancel(block: CalendarBlock): Promise<void> {
    if (await cancel(block.reservation, roomOf(block.reservation).name)) await reload();
}
</script>

<template>
    <RoomCalendar
        title="My reservations"
        :notice="error ?? undefined"
        :is-loading
        :days
        :hours
        :now
        :week-label
        :is-current-week
        :show-opening-hours="false"
        :legend-kinds="legendKinds"
        :block-actions="blockActions"
        @previous="showPreviousWeek"
        @next="showNextWeek"
        @today="showCurrentWeek"
        @withdraw="onWithdraw"
        @cancel="onCancel"
    >
        <template #actions>
            <BaseTooltip text="Hide canceled and rejected reservations" class="shrink-0">
                <SlidingCheckbox v-model="showActiveOnly" label="Active only" />
            </BaseTooltip>
        </template>
    </RoomCalendar>
</template>
