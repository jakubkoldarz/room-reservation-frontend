<script setup lang="ts">
import { computed } from "vue";
import type { Reservation, ReservationRoom, ReservationState } from "../types";
import { reservationDetailRows } from "../utils/reservationDetails";
import ReservationStatusChip from "./ReservationStatusChip.vue";

const {
    reservation,
    state,
    room = null,
} = defineProps<{
    reservation: Reservation;
    state: ReservationState;
    room?: ReservationRoom | null;
}>();

const rows = computed(() => reservationDetailRows(reservation, state, room));
</script>

<template>
    <div class="flex flex-col gap-2.5">
        <div>
            <ReservationStatusChip :state />
        </div>
        <dl class="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-xs">
            <template v-for="row in rows" :key="row.label">
                <dt class="text-text-muted">{{ row.label }}</dt>
                <dd class="text-text font-medium break-words">{{ row.value }}</dd>
            </template>
        </dl>
    </div>
</template>
