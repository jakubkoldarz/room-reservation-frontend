import type { CalendarDay, MinuteRange } from "../types";

export const SELECTION_STEP = 15;
export const DEFAULT_SELECTION_MINUTES = 60;

export function floorToStep(minutes: number): number {
    return Math.floor(minutes / SELECTION_STEP) * SELECTION_STEP;
}

function ceilToStep(minutes: number): number {
    return Math.ceil(minutes / SELECTION_STEP) * SELECTION_STEP;
}

function clamp(value: number, min: number, max: number): number {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}

export function selectableBounds(
    day: CalendarDay,
    minute: number,
    earliest: number,
): MinuteRange | null {
    if (minute < earliest) return null;

    const interval = day.openIntervals.find((open) => open.start <= minute && minute < open.end);
    if (!interval) return null;

    let start = Math.max(interval.start, earliest);
    let end = interval.end;

    for (const block of day.blocks) {
        const isBlocking = block.kind === "approved" || block.kind === "pending";
        if (!isBlocking) continue;

        const coversMinute = block.start <= minute && minute < block.end;
        if (coversMinute) return null;

        const endsBefore = block.end <= minute;
        if (endsBefore && block.end > start) start = block.end;

        const startsAfter = block.start > minute;
        if (startsAfter && block.start < end) end = block.start;
    }

    const bounds = { start: ceilToStep(start), end: floorToStep(end) };
    if (bounds.end - bounds.start < SELECTION_STEP) return null;
    return bounds;
}

function latestStart(bounds: MinuteRange): number {
    return bounds.end - SELECTION_STEP;
}

export function hoverMinute(day: CalendarDay, minute: number, earliest: number): number | null {
    const bounds = selectableBounds(day, minute, earliest);
    if (!bounds) return null;
    return clamp(floorToStep(minute), bounds.start, latestStart(bounds));
}

function anchorStart(anchor: number, bounds: MinuteRange): number {
    const snapped = clamp(floorToStep(anchor), bounds.start, bounds.end);
    return Math.min(snapped, latestStart(bounds));
}

export function rangeFromClick(anchor: number, bounds: MinuteRange): MinuteRange {
    const start = anchorStart(anchor, bounds);
    const end = Math.min(start + DEFAULT_SELECTION_MINUTES, bounds.end);
    return { start, end };
}

export function rangeFromDrag(anchor: number, pointer: number, bounds: MinuteRange): MinuteRange {
    const start = anchorStart(anchor, bounds);
    const draggedForward = pointer >= start;

    if (draggedForward) {
        const shortestEnd = start + SELECTION_STEP;
        const end = Math.max(ceilToStep(pointer), shortestEnd);
        return { start, end: clamp(end, bounds.start, bounds.end) };
    }

    return {
        start: clamp(floorToStep(pointer), bounds.start, bounds.end),
        end: start + SELECTION_STEP,
    };
}
