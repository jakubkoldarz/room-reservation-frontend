import type { MinuteRange } from "@/features/rooms/types";
import { clamp } from "@/utils/clamp";
import type { TimelineDragMode } from "../types";

export const DRAG_STEP = 15;

export function snapToStep(minutes: number): number {
    return Math.round(minutes / DRAG_STEP) * DRAG_STEP;
}

function movedRange(initial: MinuteRange, shift: number, limits: MinuteRange): MinuteRange {
    let start = initial.start + shift;
    let end = initial.end + shift;

    if (start < limits.start) {
        end = end + (limits.start - start);
        start = limits.start;
    }
    if (end > limits.end) {
        start = start - (end - limits.end);
        end = limits.end;
    }
    return { start, end };
}

export function draggedRange(
    mode: TimelineDragMode,
    initial: MinuteRange,
    anchor: number,
    pointer: number,
    limits: MinuteRange,
): MinuteRange {
    if (mode === "start") {
        const start = clamp(snapToStep(pointer), limits.start, initial.end - DRAG_STEP);
        return { start, end: initial.end };
    }
    if (mode === "end") {
        const end = clamp(snapToStep(pointer), initial.start + DRAG_STEP, limits.end);
        return { start: initial.start, end };
    }
    const shift = snapToStep(pointer - anchor);
    return movedRange(initial, shift, limits);
}
