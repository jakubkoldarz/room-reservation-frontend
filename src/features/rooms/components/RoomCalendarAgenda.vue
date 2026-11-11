<script setup lang="ts">
import ReservationDetails from "@/features/reservations/components/ReservationDetails.vue";
import Badge from "@/features/shared/Badge.vue";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import type { CalendarBlock, CalendarDay } from "../types";
import { minutesToHm, overrideLabel } from "../utils/calendar";
import { BLOCK_CLASSES, blockKindLabel } from "../utils/calendarStyles";

const {
    days,
    showOpeningHours = true,
    isActionable,
} = defineProps<{
    days: readonly CalendarDay[];
    showOpeningHours?: boolean;
    isActionable?: (block: CalendarBlock) => boolean;
}>();

const emit = defineEmits<{
    open: [block: CalendarBlock, anchor: HTMLElement];
}>();

function blockActionable(block: CalendarBlock): boolean {
    return isActionable?.(block) ?? false;
}

function openBlock(block: CalendarBlock, event: Event): void {
    if (!blockActionable(block)) return;
    emit("open", block, event.currentTarget as HTMLElement);
}

function onBlockKeydown(block: CalendarBlock, event: KeyboardEvent): void {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openBlock(block, event);
}

function dayLabel(date: Date): string {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
    }).format(date);
}

function openingHours(day: CalendarDay): string {
    if (day.openIntervals.length === 0) return "Closed";
    return day.openIntervals
        .map((interval) => `${minutesToHm(interval.start)}–${minutesToHm(interval.end)}`)
        .join(", ");
}
</script>

<template>
    <ul class="divide-border divide-y">
        <li v-for="day in days" :key="day.iso" class="flex flex-col gap-2 px-4 py-3">
            <div class="flex flex-wrap items-center gap-2">
                <span class="font-semibold" :class="{ 'text-primary': day.isToday }">
                    {{ dayLabel(day.date) }}
                </span>
                <Badge v-if="day.isToday" class="px-2!">Today</Badge>
                <span class="grow"></span>
                <span v-if="showOpeningHours" class="text-text-muted text-xs">
                    {{ openingHours(day) }}
                </span>
            </div>

            <ul v-if="day.allDay.length > 0 || day.blocks.length > 0" class="flex flex-col gap-1.5">
                <li
                    v-for="item in day.allDay"
                    :key="item.id"
                    class="rounded border-l-4 px-3 py-1.5 text-sm font-medium"
                    :class="item.isClosed ? BLOCK_CLASSES.closed : BLOCK_CLASSES.event"
                >
                    {{ overrideLabel(item) }}
                </li>
                <li
                    v-for="block in [...day.blocks].sort((a, b) => a.start - b.start)"
                    :key="block.id"
                >
                    <BaseTooltip
                        variant="card"
                        :clickable="blockActionable(block)"
                        :role="blockActionable(block) ? 'button' : undefined"
                        :tabindex="blockActionable(block) ? 0 : undefined"
                        :aria-haspopup="blockActionable(block) ? 'menu' : undefined"
                        class="flex w-full gap-3 rounded border-l-4 px-3 py-1.5 text-sm"
                        :class="[
                            BLOCK_CLASSES[block.kind],
                            blockActionable(block)
                                ? 'focus-visible:ring-primary cursor-pointer outline-none hover:brightness-95 focus-visible:ring-2'
                                : 'cursor-default',
                        ]"
                        @click="openBlock(block, $event)"
                        @keydown="onBlockKeydown(block, $event)"
                    >
                        <span class="w-24 shrink-0 font-semibold">{{ block.time }}</span>
                        <span class="flex min-w-0 flex-col">
                            <span class="truncate font-medium">{{ block.title }}</span>
                            <span class="truncate text-xs opacity-80">
                                {{
                                    [blockKindLabel(block.kind), block.detail]
                                        .filter(Boolean)
                                        .join(" · ")
                                }}
                            </span>
                        </span>
                        <template #content>
                            <ReservationDetails
                                :reservation="block.reservation"
                                :state="block.kind"
                                :room="block.room"
                            />
                        </template>
                    </BaseTooltip>
                </li>
            </ul>
            <p v-else class="text-text-muted text-xs">No reservations</p>
        </li>
    </ul>
</template>
