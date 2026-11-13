<script setup lang="ts">
import { NoSymbolIcon, PencilSquareIcon, TrashIcon } from "@heroicons/vue/24/solid";
import { onClickOutside, useEventListener } from "@vueuse/core";
import { computed, nextTick, onMounted, ref, useId, useTemplateRef } from "vue";
import { clamp } from "@/utils/clamp";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { reservationRoutes } from "../routes";
import type { Reservation, ReservationAction, ReservationState } from "../types";
import { formatReservationDate, formatReservationTime } from "../utils/reservationDetails";
import ReservationStatusChip from "./ReservationStatusChip.vue";

const { anchor, reservation, state, roomName, actions } = defineProps<{
    anchor: HTMLElement;
    reservation: Reservation;
    state: ReservationState;
    roomName: string;
    actions: readonly ReservationAction[];
}>();

const emit = defineEmits<{
    close: [];
    withdraw: [];
    cancel: [];
}>();

const GAP = 6;
const MARGIN = 8;

const titleId = useId();
const menu = useTemplateRef("menu");
const { hasPermission } = usePermissions();

const top = ref(0);
const left = ref(0);
const isPositioned = ref(false);

const canEdit = computed(
    () => actions.includes("edit") && hasPermission(Permission.ReservationView),
);
const editLink = computed(() => ({
    name: reservationRoutes.edit.name,
    params: { reservationId: reservation.id },
}));

function items(): HTMLElement[] {
    if (!menu.value) return [];
    return [...menu.value.querySelectorAll<HTMLElement>('[role="menuitem"]')];
}

function updatePosition(): void {
    if (!menu.value) return;
    const target = anchor.getBoundingClientRect();
    const box = menu.value.getBoundingClientRect();

    const below = target.bottom + GAP;
    const above = target.top - box.height - GAP;
    const fitsBelow = below + box.height <= window.innerHeight - MARGIN;
    const fitsAbove = above >= MARGIN;
    let preferred = above;
    if (fitsBelow || !fitsAbove) preferred = below;
    top.value = clamp(preferred, MARGIN, window.innerHeight - box.height - MARGIN);

    const centered = target.left + target.width / 2 - box.width / 2;
    left.value = clamp(centered, MARGIN, window.innerWidth - box.width - MARGIN);
    isPositioned.value = true;
}

function close(returnFocus = false): void {
    emit("close");
    if (returnFocus) anchor.focus();
}

function choose(action: "withdraw" | "cancel"): void {
    if (action === "withdraw") {
        emit("withdraw");
    } else {
        emit("cancel");
    }
}

function onKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
    }
    if (event.key === "Tab") {
        close();
        return;
    }
    const list = items();
    if (list.length === 0) return;

    const lastIndex = list.length - 1;
    const index = list.indexOf(document.activeElement as HTMLElement);
    let target = index;

    if (event.key === "ArrowDown") {
        target = index + 1;
    } else if (event.key === "ArrowUp") {
        target = index - 1;
    } else if (event.key === "Home") {
        target = 0;
    } else if (event.key === "End") {
        target = lastIndex;
    } else {
        return;
    }

    if (target > lastIndex) target = 0;
    if (target < 0) target = lastIndex;

    event.preventDefault();
    list[target].focus();
}

onClickOutside(menu, () => close(), { ignore: [anchor] });
useEventListener(window, "scroll", () => close(), { capture: true, passive: true });
useEventListener(window, "resize", () => close(), { passive: true });

onMounted(async () => {
    await nextTick();
    updatePosition();
    items()[0]?.focus();
});
</script>

<template>
    <Teleport to="body">
        <div
            ref="menu"
            role="menu"
            :aria-labelledby="titleId"
            class="bg-surface text-text border-border fixed z-1100 flex w-64 max-w-[calc(100vw-16px)] flex-col rounded-lg border p-1 shadow-xl transition-opacity duration-100"
            :class="isPositioned ? 'opacity-100' : 'opacity-0'"
            :style="{ top: `${top}px`, left: `${left}px` }"
            @keydown="onKeydown"
        >
            <div class="flex flex-col gap-1.5 px-2.5 pt-2 pb-2.5">
                <div class="flex items-center justify-between gap-2">
                    <span :id="titleId" class="truncate text-sm font-semibold">{{ roomName }}</span>
                    <ReservationStatusChip :state />
                </div>
                <span class="text-text-muted text-xs tabular-nums">
                    {{ formatReservationDate(reservation.date) }},
                    {{ formatReservationTime(reservation) }}
                </span>
                <span v-if="reservation.purpose" class="text-text-muted truncate text-xs">
                    {{ reservation.purpose }}
                </span>
            </div>

            <div class="border-border border-t pt-1">
                <RouterLink
                    v-if="canEdit"
                    :to="editLink"
                    role="menuitem"
                    tabindex="-1"
                    class="hover:bg-background focus-visible:bg-background flex items-center gap-2 rounded px-2.5 py-1.5 text-sm outline-none"
                    @click="close()"
                >
                    <PencilSquareIcon class="text-text-muted size-4" />
                    Edit reservation
                </RouterLink>
                <button
                    v-if="actions.includes('withdraw')"
                    type="button"
                    role="menuitem"
                    tabindex="-1"
                    class="text-danger hover:bg-danger/10 focus-visible:bg-danger/10 flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-left text-sm outline-none"
                    @click="choose('withdraw')"
                >
                    <TrashIcon class="size-4" />
                    Withdraw request
                </button>
                <button
                    v-if="actions.includes('cancel')"
                    type="button"
                    role="menuitem"
                    tabindex="-1"
                    class="text-warning-text hover:bg-warning/10 focus-visible:bg-warning/10 flex w-full cursor-pointer items-center gap-2 rounded px-2.5 py-1.5 text-left text-sm outline-none"
                    @click="choose('cancel')"
                >
                    <NoSymbolIcon class="size-4" />
                    Cancel reservation
                </button>
            </div>
        </div>
    </Teleport>
</template>
