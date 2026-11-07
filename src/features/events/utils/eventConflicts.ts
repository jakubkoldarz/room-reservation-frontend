import type { ApiError } from "@/api/errors";
import { conflictingItems } from "@/features/rooms/utils/conflicts";
import { ConflictingEventSchema } from "../schemas";
import type { ConflictingEvent, EventForm } from "../types";
import { formatEventDates } from "./eventFormat";

export function eventConflicts(error: ApiError): ConflictingEvent[] {
    return conflictingItems(error, ConflictingEventSchema);
}

export function toEventRequest(values: EventForm, roomIds: string[]) {
    return {
        name: values.name,
        roomIds,
        startDate: values.startDate,
        endDate: values.endDate,
        isClosed: values.isClosed,
        startTime: values.isClosed ? null : `${values.startTime}:00`,
        endTime: values.isClosed ? null : `${values.endTime}:00`,
    };
}

export function overlapMessage(events: readonly ConflictingEvent[]): string {
    const list = events.map((event) => `${event.name} (${formatEventDates(event)})`).join(", ");
    return `Some rooms already have an event on these days: ${list}.`;
}
