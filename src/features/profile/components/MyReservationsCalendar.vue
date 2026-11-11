<script setup lang="ts">
import { useIntervalFn, useNow } from "@vueuse/core";
import { computed } from "vue";
import { useMyReservations } from "@/features/reservations/composables/useMyReservations";
import { useOwnReservationActions } from "@/features/reservations/composables/useOwnReservationActions";
import type { Reservation, ReservationRoom } from "@/features/reservations/types";
import { ownReservationActions } from "@/features/reservations/utils/reservationActions";
import RoomCalendar from "@/features/rooms/components/RoomCalendar.vue";
import { useCalendarWeek } from "@/features/rooms/composables/useCalendarWeek";
import type { CalendarBlock } from "@/features/rooms/types";
import { buildCalendarDays, hourRange } from "@/features/rooms/utils/calendar";
import { PERSONAL_LEGEND_KINDS } from "@/features/rooms/utils/calendarStyles";

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

const days = computed(() =>
    buildCalendarDays({
        weekStart: weekStart.value,
        now: now.value,
        reservations: items.value.map((item) => item.reservationInfo),
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
        :legend-kinds="PERSONAL_LEGEND_KINDS"
        :block-actions="blockActions"
        @previous="showPreviousWeek"
        @next="showNextWeek"
        @today="showCurrentWeek"
        @withdraw="onWithdraw"
        @cancel="onCancel"
    />
</template>
