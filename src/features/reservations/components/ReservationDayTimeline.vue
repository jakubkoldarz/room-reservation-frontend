<script setup lang="ts">
import { computed, ref, useTemplateRef } from "vue";
import type { Availability } from "@/features/availabilities/types";
import { formatHm, toMinutes } from "@/features/availabilities/utils/schedule";
import type { MinuteRange } from "@/features/rooms/types";
import { minutesToHm } from "@/features/rooms/utils/calendar";
import { CLOSED_HOURS_BACKGROUND } from "@/features/rooms/utils/calendarStyles";
import type { ReservationTimeRange, TimelineDragMode } from "../types";
import { isSameTimeRange } from "../utils/reservationEdit";
import { draggedRange } from "../utils/timelineDrag";

const {
    slots,
    busy,
    original,
    selection = null,
    invalid = false,
    editable = false,
} = defineProps<{
    slots: readonly Availability[];
    busy: readonly ReservationTimeRange[];
    original: ReservationTimeRange;
    selection?: ReservationTimeRange | null;
    invalid?: boolean;
    editable?: boolean;
}>();

const emit = defineEmits<{
    change: [range: ReservationTimeRange];
}>();

const DEFAULT_START = 8 * 60;
const DEFAULT_END = 18 * 60;

const shownSelection = computed(() => {
    if (!selection) return null;

    const isValidRange = toMinutes(selection.startTime) < toMinutes(selection.endTime);
    if (!isValidRange) return null;
    return selection;
});
const showOriginal = computed(
    () => !shownSelection.value || !isSameTimeRange(shownSelection.value, original),
);

const bounds = computed(() => {
    const ranges: ReservationTimeRange[] = [...slots, ...busy, original];
    if (shownSelection.value) ranges.push(shownSelection.value);

    let earliest = DEFAULT_START;
    let latest = DEFAULT_END;
    for (const range of ranges) {
        const rangeStart = toMinutes(range.startTime);
        const rangeEnd = toMinutes(range.endTime);
        earliest = Math.min(earliest, rangeStart, rangeEnd);
        latest = Math.max(latest, rangeStart, rangeEnd);
    }

    const start = Math.floor(earliest / 60) * 60;
    const end = Math.ceil(latest / 60) * 60;
    return { start, end, span: end - start };
});

const hours = computed(() => {
    const firstHour = bounds.value.start / 60;
    const lastHour = bounds.value.end / 60;

    let labelEvery = 1;
    if (lastHour - firstHour > 12) labelEvery = 2;

    const marks = [];
    for (let hour = firstHour; hour <= lastHour; hour++) {
        const minutesFromStart = hour * 60 - bounds.value.start;
        const hoursFromStart = hour - firstHour;
        marks.push({
            hour,
            left: (minutesFromStart / bounds.value.span) * 100,
            labelled: hoursFromStart % labelEvery === 0,
        });
    }
    return marks;
});

const innerTicks = computed(() => hours.value.slice(1, -1));
const labelledHours = computed(() => hours.value.filter((mark) => mark.labelled));

function place(range: ReservationTimeRange) {
    const start = toMinutes(range.startTime);
    const end = toMinutes(range.endTime);
    return {
        left: `${((start - bounds.value.start) / bounds.value.span) * 100}%`,
        width: `${((end - start) / bounds.value.span) * 100}%`,
    };
}

function label(range: ReservationTimeRange): string {
    return `${formatHm(range.startTime)}–${formatHm(range.endTime)}`;
}

type Drag = {
    mode: TimelineDragMode;
    initial: MinuteRange;
    anchor: number;
};

const track = useTemplateRef("track");
const drag = ref<Drag | null>(null);

function minuteAt(event: PointerEvent): number {
    if (!track.value) return bounds.value.start;
    const box = track.value.getBoundingClientRect();
    const x = event.clientX - box.left;
    return bounds.value.start + (x / box.width) * bounds.value.span;
}

function dragModeOf(event: PointerEvent): TimelineDragMode {
    const handle = (event.target as HTMLElement).dataset.handle;
    if (handle === "start") return "start";
    if (handle === "end") return "end";
    return "move";
}

function onPointerDown(event: PointerEvent): void {
    const current = shownSelection.value;
    if (!editable || !current || event.button !== 0) return;

    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    drag.value = {
        mode: dragModeOf(event),
        initial: { start: toMinutes(current.startTime), end: toMinutes(current.endTime) },
        anchor: minuteAt(event),
    };
}

function onPointerMove(event: PointerEvent): void {
    const current = drag.value;
    if (!current) return;

    const limits = { start: bounds.value.start, end: bounds.value.end };
    const next = draggedRange(
        current.mode,
        current.initial,
        current.anchor,
        minuteAt(event),
        limits,
    );
    const range = { startTime: minutesToHm(next.start), endTime: minutesToHm(next.end) };

    const selected = shownSelection.value;
    if (selected && isSameTimeRange(selected, range)) return;
    emit("change", range);
}

function stopDrag(): void {
    drag.value = null;
}

const selectionClasses = computed(() => {
    const classes: string[] = [];
    if (invalid) {
        classes.push("bg-danger/15 border-danger text-danger");
    } else {
        classes.push("bg-primary/15 border-primary text-primary");
    }
    if (editable && drag.value) classes.push("cursor-grabbing touch-none select-none");
    if (editable && !drag.value) classes.push("cursor-grab touch-none select-none");
    return classes;
});
</script>

<template>
    <div class="flex flex-col gap-1">
        <div
            ref="track"
            class="border-border bg-closed relative h-16 overflow-hidden rounded border"
            :style="{ backgroundImage: CLOSED_HOURS_BACKGROUND }"
            aria-hidden="true"
        >
            <div
                v-for="(slot, index) in slots"
                :key="`slot-${index}`"
                class="bg-surface absolute inset-y-0"
                :style="place(slot)"
            ></div>

            <div
                v-for="tick in innerTicks"
                :key="`tick-${tick.hour}`"
                class="bg-border/70 absolute inset-y-0 w-px"
                :style="{ left: `${tick.left}%` }"
            ></div>

            <div
                v-for="(range, index) in busy"
                :key="`busy-${index}`"
                class="bg-text-muted/15 border-text-muted/50 text-text-muted absolute inset-y-2 overflow-hidden rounded border-l-4 px-1 text-[10px] leading-4"
                :style="place(range)"
            >
                <span class="block truncate">Booked</span>
            </div>

            <div
                v-if="showOriginal"
                class="border-text-muted/60 absolute inset-y-1 rounded border-2 border-dashed"
                :style="place(original)"
            ></div>

            <div
                v-if="shownSelection"
                class="absolute inset-y-2 overflow-hidden rounded border-l-4 px-1 text-xs leading-4 font-medium"
                :class="selectionClasses"
                :style="place(shownSelection)"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="stopDrag"
                @pointercancel="stopDrag"
                @lostpointercapture="stopDrag"
            >
                <span class="pointer-events-none block truncate tabular-nums">
                    {{ label(shownSelection) }}
                </span>
                <span
                    v-if="editable"
                    data-handle="start"
                    class="absolute inset-y-0 left-0 w-2 cursor-ew-resize"
                ></span>
                <span
                    v-if="editable"
                    data-handle="end"
                    class="absolute inset-y-0 right-0 w-2 cursor-ew-resize"
                ></span>
            </div>
        </div>

        <div class="text-text-muted relative h-4 text-[10px] tabular-nums" aria-hidden="true">
            <span
                v-for="tick in labelledHours"
                :key="`label-${tick.hour}`"
                class="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
                :style="{ left: `${tick.left}%` }"
            >
                {{ String(tick.hour).padStart(2, "0") }}
            </span>
        </div>

        <p v-if="editable" class="text-text-muted text-xs">
            Drag the highlighted bar to move your reservation, or drag its edges to change the start
            or the end. The time fields above update as you drag.
        </p>

        <ul class="sr-only">
            <li v-for="(slot, index) in slots" :key="`sr-slot-${index}`">Open {{ label(slot) }}</li>
            <li v-for="(range, index) in busy" :key="`sr-busy-${index}`">
                Booked {{ label(range) }}
            </li>
            <li v-if="shownSelection">Your reservation {{ label(shownSelection) }}</li>
        </ul>

        <div class="text-text-muted mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            <span class="flex items-center gap-1.5">
                <span class="border-border bg-surface size-3 rounded-sm border"></span> Open
            </span>
            <span class="flex items-center gap-1.5">
                <span
                    class="border-border bg-closed size-3 rounded-sm border"
                    :style="{ backgroundImage: CLOSED_HOURS_BACKGROUND }"
                ></span>
                Closed
            </span>
            <span class="flex items-center gap-1.5">
                <span
                    class="bg-text-muted/15 border-text-muted/50 size-3 rounded-sm border-l-4"
                ></span>
                Booked
            </span>
            <span class="flex items-center gap-1.5">
                <span class="bg-primary/15 border-primary size-3 rounded-sm border-l-4"></span>
                Your reservation
            </span>
            <span class="flex items-center gap-1.5">
                <span class="border-text-muted/60 size-3 rounded-sm border-2 border-dashed"></span>
                Before the change
            </span>
        </div>
    </div>
</template>
