import { ref } from "vue";
import type { ApiResult } from "@/api/apiCall";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import type { ConflictingReservation } from "@/features/rooms/types";
import {
    reservationConflictItems,
    reservationConflicts,
    reservationsAffectedMessage,
} from "@/features/rooms/utils/conflicts";
import type { EventInfo, EventSaveOutcome } from "../types";
import { eventConflicts } from "../utils/eventConflicts";

export function useEventSave(roomNames: () => ReadonlyMap<string, string>) {
    const confirm = useConfirm();
    const isSaving = ref(false);

    function roomName(roomId: string): string | undefined {
        return roomNames().get(roomId);
    }

    async function askToCancelReservations(
        reservations: readonly ConflictingReservation[],
        confirmTitle: string,
        confirmText: string,
    ): Promise<boolean> {
        return await confirm({
            title: confirmTitle,
            message: reservationsAffectedMessage(reservations.length),
            items: reservationConflictItems(reservations, roomName),
            confirmText,
            danger: true,
        });
    }

    function toOutcome(result: ApiResult<EventInfo>): EventSaveOutcome {
        if (result.ok) {
            return { kind: "saved", event: result.data };
        }

        const overlapping = eventConflicts(result.error);
        if (overlapping.length > 0) {
            return { kind: "overlap", events: overlapping };
        }
        return { kind: "failed", error: result.error };
    }

    async function save(
        send: (force: boolean) => Promise<ApiResult<EventInfo>>,
        confirmTitle: string,
        confirmText: string,
    ): Promise<EventSaveOutcome> {
        if (isSaving.value) return { kind: "canceled" };

        isSaving.value = true;
        const firstResult = await send(false);
        isSaving.value = false;

        if (firstResult.ok) return toOutcome(firstResult);

        const reservations = reservationConflicts(firstResult.error);
        if (reservations.length === 0) return toOutcome(firstResult);

        const confirmed = await askToCancelReservations(reservations, confirmTitle, confirmText);
        if (!confirmed) return { kind: "canceled" };

        isSaving.value = true;
        const forcedResult = await send(true);
        isSaving.value = false;

        return toOutcome(forcedResult);
    }

    return { save, isSaving };
}
