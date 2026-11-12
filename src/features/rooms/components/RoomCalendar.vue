<script setup lang="ts">
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/vue/24/solid";
import Container from "@/features/shared/Container.vue";
import IconButton from "@/features/shared/IconButton.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { computed, shallowRef, watch } from "vue";
import ReservationActionsMenu from "@/features/reservations/components/ReservationActionsMenu.vue";
import type { ReservationAction } from "@/features/reservations/types";
import type { CalendarBlock, CalendarBlockKind, CalendarDay, CalendarSelection } from "../types";
import {
    BLOCK_CLASSES,
    CLOSED_HOURS_BACKGROUND,
    LEGEND,
    ROOM_LEGEND_KINDS,
} from "../utils/calendarStyles";
import RoomCalendarAgenda from "./RoomCalendarAgenda.vue";
import RoomCalendarGrid from "./RoomCalendarGrid.vue";

const {
    days,
    hours,
    now,
    weekLabel,
    isCurrentWeek,
    isLoading = false,
    title,
    notice,
    showOpeningHours = true,
    selectable = false,
    selection = null,
    legendKinds = ROOM_LEGEND_KINDS,
    blockActions,
} = defineProps<{
    days: readonly CalendarDay[];
    hours: { start: number; end: number };
    now: Date;
    weekLabel: string;
    isCurrentWeek: boolean;
    isLoading?: boolean;
    title?: string;
    notice?: string;
    showOpeningHours?: boolean;
    selectable?: boolean;
    selection?: CalendarSelection | null;
    legendKinds?: readonly CalendarBlockKind[];
    blockActions?: (block: CalendarBlock) => ReservationAction[];
}>();

defineSlots<{
    actions?(): unknown;
}>();

const legend = computed(() => LEGEND.filter((item) => legendKinds.includes(item.kind)));

const emit = defineEmits<{
    previous: [];
    next: [];
    today: [];
    select: [selection: CalendarSelection];
    withdraw: [block: CalendarBlock];
    cancel: [block: CalendarBlock];
}>();

const openMenu = shallowRef<{
    block: CalendarBlock;
    anchor: HTMLElement;
    actions: ReservationAction[];
} | null>(null);

function actionsOf(block: CalendarBlock): ReservationAction[] {
    if (!blockActions) return [];
    return blockActions(block);
}

function isActionable(block: CalendarBlock): boolean {
    return actionsOf(block).length > 0;
}

function onOpen(block: CalendarBlock, anchor: HTMLElement): void {
    const isAlreadyOpen = openMenu.value !== null && openMenu.value.block.id === block.id;
    if (isAlreadyOpen) {
        openMenu.value = null;
        return;
    }
    openMenu.value = { block, anchor, actions: actionsOf(block) };
}

function onMenuAction(action: "withdraw" | "cancel"): void {
    if (!openMenu.value) return;
    const block = openMenu.value.block;
    openMenu.value = null;
    if (action === "withdraw") {
        emit("withdraw", block);
    } else {
        emit("cancel", block);
    }
}

watch(
    () => days,
    () => (openMenu.value = null),
);
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div class="border-border flex items-center gap-3 border-b p-4">
            <div class="flex min-w-0 flex-1 flex-col @md:flex-row @md:items-baseline @md:gap-2">
                <h2 class="text-lg leading-tight font-semibold">{{ title ?? weekLabel }}</h2>
                <span v-if="title" class="text-text-muted truncate text-sm">{{ weekLabel }}</span>
            </div>
            <slot name="actions" />
            <div class="flex shrink-0 items-center gap-1">
                <OutlineButton
                    class="mr-1 rounded-lg py-1"
                    :disabled="isCurrentWeek"
                    @click="emit('today')"
                >
                    Today
                </OutlineButton>
                <IconButton
                    class="grid size-8 place-items-center p-1"
                    aria-label="Previous week"
                    @click="emit('previous')"
                >
                    <ChevronLeftIcon class="size-5" />
                </IconButton>
                <IconButton
                    class="grid size-8 place-items-center p-1"
                    aria-label="Next week"
                    @click="emit('next')"
                >
                    <ChevronRightIcon class="size-5" />
                </IconButton>
            </div>
        </div>

        <p
            v-if="notice"
            class="border-border bg-background text-text-muted border-b px-4 py-2 text-sm"
        >
            {{ notice }}
        </p>

        <div class="hidden @3xl:block">
            <RoomCalendarGrid
                :days
                :hours
                :now
                :show-opening-hours
                :is-loading
                :selectable
                :selection
                :is-actionable="isActionable"
                @select="emit('select', $event)"
                @open="onOpen"
            />
        </div>
        <div v-if="isLoading" class="flex animate-pulse flex-col gap-3 p-4 @3xl:hidden">
            <Skeleton v-for="n in 7" :key="n" class="w-full" />
        </div>
        <RoomCalendarAgenda
            v-else
            :days
            :show-opening-hours
            :is-actionable="isActionable"
            class="@3xl:hidden"
            @open="onOpen"
        />

        <ReservationActionsMenu
            v-if="openMenu"
            :key="openMenu.block.id"
            :anchor="openMenu.anchor"
            :reservation="openMenu.block.reservation"
            :state="openMenu.block.kind"
            :room-name="openMenu.block.room?.name ?? openMenu.block.title"
            :actions="openMenu.actions"
            @close="openMenu = null"
            @withdraw="onMenuAction('withdraw')"
            @cancel="onMenuAction('cancel')"
        />

        <ul
            class="border-border text-text-muted flex flex-wrap gap-x-4 gap-y-2 border-t p-4 text-xs"
        >
            <li v-for="item in legend" :key="item.kind" class="flex items-center gap-1.5">
                <span class="size-3 rounded-sm border-l-4" :class="BLOCK_CLASSES[item.kind]"></span>
                {{ item.label }}
            </li>
            <li v-if="showOpeningHours" class="flex items-center gap-1.5">
                <span
                    class="border-border bg-background size-3 rounded-sm border"
                    :style="{ backgroundImage: CLOSED_HOURS_BACKGROUND }"
                ></span>
                Outside opening hours
            </li>
        </ul>
    </Container>
</template>
