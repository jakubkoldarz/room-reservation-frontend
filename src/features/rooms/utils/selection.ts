import type { CalendarDay, MinuteRange } from "../types";

export const SELECTION_STEP = 15;
export const DEFAULT_SELECTION_MINUTES = 60;

const BLOCKING_KINDS = new Set(["approved", "pending"]);

export function floorToStep(minutes: number): number {
    return Math.floor(minutes / SELECTION_STEP) * SELECTION_STEP;
}

function ceilToStep(minutes: number): number {
    return Math.ceil(minutes / SELECTION_STEP) * SELECTION_STEP;
}

export function selectableBounds(
    day: CalendarDay,
    minute: number,
    earliest: number,
): MinuteRange | null {
    if (minute < earliest) return null;

    const interval = day.openIntervals.find((open) => open.start <= minute && minute < open.end);
    if (!interval) return null;

    const blocking = day.blocks.filter((block) => BLOCKING_KINDS.has(block.kind));
    if (blocking.some((block) => block.start <= minute && minute < block.end)) return null;

    const start = Math.max(
        interval.start,
        earliest,
        ...blocking.filter((block) => block.end <= minute).map((block) => block.end),
    );
    const end = Math.min(
        interval.end,
        ...blocking.filter((block) => block.start > minute).map((block) => block.start),
    );

    const bounds = { start: ceilToStep(start), end: floorToStep(end) };
    return bounds.end - bounds.start >= SELECTION_STEP ? bounds : null;
}

export function hoverMinute(day: CalendarDay, minute: number, earliest: number): number | null {
    const bounds = selectableBounds(day, minute, earliest);
    if (!bounds) return null;
    return Math.min(Math.max(floorToStep(minute), bounds.start), bounds.end - SELECTION_STEP);
}

function clamp(value: number, bounds: MinuteRange): number {
    return Math.min(Math.max(value, bounds.start), bounds.end);
}

export function rangeFromClick(anchor: number, bounds: MinuteRange): MinuteRange {
    const start = Math.min(clamp(floorToStep(anchor), bounds), bounds.end - SELECTION_STEP);
    return { start, end: Math.min(start + DEFAULT_SELECTION_MINUTES, bounds.end) };
}

export function rangeFromDrag(anchor: number, pointer: number, bounds: MinuteRange): MinuteRange {
    const anchorStart = Math.min(clamp(floorToStep(anchor), bounds), bounds.end - SELECTION_STEP);
    if (pointer >= anchorStart) {
        return {
            start: anchorStart,
            end: clamp(Math.max(ceilToStep(pointer), anchorStart + SELECTION_STEP), bounds),
        };
    }
    return {
        start: clamp(floorToStep(pointer), bounds),
        end: anchorStart + SELECTION_STEP,
    };
}
