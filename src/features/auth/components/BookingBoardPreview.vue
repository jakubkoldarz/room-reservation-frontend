<script setup lang="ts">
import { DARK_CLOSED_HOURS_BACKGROUND } from "@/features/rooms/utils/calendarStyles";

type PreviewKind = "approved" | "pending" | "event";

interface PreviewBlock {
    start: number;
    end: number;
    kind: PreviewKind;
    room: string;
    title: string;
}

interface PreviewDay {
    open: { start: number; end: number };
    blocks: PreviewBlock[];
}

const START_HOUR = 8;
const END_HOUR = 17;
const HOUR_HEIGHT = 30;
const BODY_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
const HOUR_MARKS = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);

const KIND_CLASSES: Record<PreviewKind, string> = {
    approved: "bg-primary/30 border-primary",
    pending: "bg-warning/15 border-warning border-dashed",
    event: "bg-text-muted-secondary/20 border-text-muted-secondary",
};

const WEEK: PreviewDay[] = [
    {
        open: { start: 8, end: 17 },
        blocks: [
            { start: 9, end: 10.5, kind: "approved", room: "A-101", title: "Lecture" },
            { start: 13, end: 15, kind: "pending", room: "B-204", title: "Workshop" },
        ],
    },
    {
        open: { start: 8, end: 17 },
        blocks: [
            { start: 8.5, end: 10, kind: "approved", room: "Lab 3", title: "Classes" },
            { start: 11, end: 12.5, kind: "approved", room: "A-101", title: "Seminar" },
        ],
    },
    {
        open: { start: 10, end: 14 },
        blocks: [{ start: 10, end: 14, kind: "event", room: "C-12", title: "Open day" }],
    },
    {
        open: { start: 8, end: 17 },
        blocks: [
            { start: 9, end: 11, kind: "pending", room: "A-101", title: "Exam prep" },
            { start: 14, end: 16, kind: "approved", room: "B-204", title: "Board meeting" },
        ],
    },
    {
        open: { start: 8, end: 13 },
        blocks: [{ start: 8.5, end: 10, kind: "approved", room: "Lab 3", title: "Lab" }],
    },
];

const today = new Date();
const monday = new Date(today);
monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

const days = WEEK.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
        ...day,
        weekday: date.toLocaleDateString("en-GB", { weekday: "short" }),
        dayOfMonth: date.getDate(),
        isToday: date.toDateString() === today.toDateString(),
    };
});

const nowHour = today.getHours() + today.getMinutes() / 60;
const showNow = nowHour >= START_HOUR && nowHour <= END_HOUR;

function offset(hour: number): number {
    return (hour - START_HOUR) * HOUR_HEIGHT;
}

function formatHour(hour: number): string {
    const minutes = Math.round((hour % 1) * 60);
    return `${String(Math.floor(hour)).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
</script>

<template>
    <div aria-hidden="true" class="flex flex-col gap-4 select-none">
        <div
            class="border-border-secondary bg-secondary-hover/40 overflow-hidden rounded-md border shadow-2xl shadow-black/30"
        >
            <div class="border-border-secondary flex items-center gap-2 border-b px-3 py-2">
                <span class="text-text-secondary text-xs font-semibold">A-101 · Lecture hall</span>
                <span class="text-text-muted-secondary text-[10px]">Building A · Floor 1</span>
                <span
                    class="bg-success/20 text-success ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium"
                >
                    Open now
                </span>
            </div>

            <div class="grid grid-cols-[2.75rem_repeat(5,minmax(0,1fr))]">
                <div class="border-border-secondary border-b"></div>
                <div
                    v-for="day in days"
                    :key="day.weekday"
                    class="border-border-secondary flex flex-col items-center gap-0.5 border-b border-l py-1.5"
                >
                    <span class="text-text-muted-secondary text-[10px] uppercase">
                        {{ day.weekday }}
                    </span>
                    <span
                        class="flex size-6 items-center justify-center rounded-full text-xs font-semibold"
                        :class="day.isToday ? 'bg-primary text-surface' : 'text-text-secondary'"
                    >
                        {{ day.dayOfMonth }}
                    </span>
                </div>

                <div class="relative" :style="{ height: `${BODY_HEIGHT}px` }">
                    <span
                        v-for="hour in HOUR_MARKS.slice(1)"
                        :key="hour"
                        class="text-text-muted-secondary absolute right-1.5 -translate-y-1/2 text-[9px] tabular-nums"
                        :style="{ top: `${offset(hour)}px` }"
                    >
                        {{ formatHour(hour) }}
                    </span>
                </div>

                <div
                    v-for="day in days"
                    :key="`body-${day.weekday}`"
                    class="border-border-secondary relative border-l"
                    :style="{
                        height: `${BODY_HEIGHT}px`,
                        backgroundImage: DARK_CLOSED_HOURS_BACKGROUND,
                    }"
                >
                    <div
                        class="bg-secondary absolute inset-x-0"
                        :style="{
                            top: `${offset(day.open.start)}px`,
                            height: `${offset(day.open.end) - offset(day.open.start)}px`,
                        }"
                    ></div>
                    <div
                        v-for="hour in HOUR_MARKS.slice(1)"
                        :key="hour"
                        class="border-border-secondary/60 absolute inset-x-0 border-t"
                        :style="{ top: `${offset(hour)}px` }"
                    ></div>
                    <div
                        v-for="block in day.blocks"
                        :key="`${block.room}-${block.start}`"
                        class="absolute inset-x-0.5 flex flex-col overflow-hidden rounded border-l-4 px-1 py-0.5"
                        :class="KIND_CLASSES[block.kind]"
                        :style="{
                            top: `${offset(block.start) + 1}px`,
                            height: `${offset(block.end) - offset(block.start) - 2}px`,
                        }"
                    >
                        <span class="text-text-secondary truncate text-[10px] font-semibold">
                            {{ formatHour(block.start) }}
                        </span>
                        <span class="text-text-secondary/80 truncate text-[10px]">
                            {{ block.room }} · {{ block.title }}
                        </span>
                    </div>
                    <div
                        v-if="day.isToday && showNow"
                        class="bg-danger absolute inset-x-0 z-10 h-0.5"
                        :style="{ top: `${offset(nowHour)}px` }"
                    >
                        <span
                            class="bg-danger absolute -top-1 -left-1 size-2.5 rounded-full"
                        ></span>
                    </div>
                </div>
            </div>
        </div>

        <ul class="flex flex-wrap gap-x-4 gap-y-1.5">
            <li class="flex items-center gap-1.5">
                <span class="bg-primary/30 border-primary size-3 rounded-sm border-l-4"></span>
                <span class="text-text-muted-secondary text-xs">Confirmed</span>
            </li>
            <li class="flex items-center gap-1.5">
                <span
                    class="bg-warning/15 border-warning size-3 rounded-sm border-l-4 border-dashed"
                ></span>
                <span class="text-text-muted-secondary text-xs">Waiting for approval</span>
            </li>
            <li class="flex items-center gap-1.5">
                <span
                    class="border-border-secondary size-3 rounded-sm border"
                    :style="{ backgroundImage: DARK_CLOSED_HOURS_BACKGROUND }"
                ></span>
                <span class="text-text-muted-secondary text-xs">Closed</span>
            </li>
        </ul>
    </div>
</template>
