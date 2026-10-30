import { reservationStateLabel } from "@/features/reservations/utils/reservationState";
import type { CalendarBlockKind } from "../types";

export const BLOCK_CLASSES: Record<CalendarBlockKind, string> = {
    approved: "bg-primary/10 border-primary text-primary",
    pending: "bg-warning/10 border-warning text-warning-text border-dashed",
    rejected: "bg-text-muted/10 border-text-muted/40 text-text-muted line-through",
    canceled: "bg-text-muted/10 border-text-muted/40 text-text-muted line-through",
    event: "bg-secondary/10 border-secondary text-secondary",
    closed: "bg-danger/10 border-danger text-danger",
};

export const LEGEND: { kind: CalendarBlockKind; label: string }[] = [
    { kind: "approved", label: "Confirmed" },
    { kind: "pending", label: "Waiting for approval" },
    { kind: "canceled", label: "Canceled / rejected" },
    { kind: "event", label: "Event" },
    { kind: "closed", label: "Closed" },
];

export function blockKindLabel(kind: CalendarBlockKind): string {
    if (kind === "event") return "Event";
    if (kind === "closed") return "Closed";
    return reservationStateLabel(kind);
}

export const CLOSED_HOURS_BACKGROUND =
    "repeating-linear-gradient(135deg, transparent 0 6px, color-mix(in srgb, var(--color-text-muted) 12%, transparent) 6px 7px)";
