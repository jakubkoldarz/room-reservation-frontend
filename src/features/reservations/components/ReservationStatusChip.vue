<script setup lang="ts">
import type { ReservationState } from "../types";
import { reservationStateLabel } from "../utils/reservationState";

defineProps<{
    state: ReservationState;
}>();

const STATE_CLASSES: Record<ReservationState, string> = {
    approved: "bg-primary/10 border-primary text-primary",
    pending: "bg-warning/10 border-warning text-warning-text",
    rejected: "bg-danger/10 border-danger text-danger",
    canceled: "bg-text-muted/10 border-text-muted/40 text-text-muted",
};
</script>

<template>
    <span
        class="inline-flex rounded border-l-4 px-2 py-0.5 text-xs font-medium whitespace-nowrap"
        :class="STATE_CLASSES[state]"
    >
        {{ reservationStateLabel(state) }}
    </span>
</template>
