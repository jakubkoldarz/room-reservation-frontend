import { ref } from "vue";
import type { ApiResult } from "@/api/apiCall";
import { useConfirm } from "@/features/modal/composables/useConfirm";
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

    async function save(
        send: (force: boolean) => Promise<ApiResult<EventInfo>>,
        confirmTitle: string,
        confirmText: string,
    ): Promise<EventSaveOutcome> {
        if (isSaving.value) return { kind: "canceled" };

        isSaving.value = true;
        let result = await send(false);

        if (!result.ok) {
            const reservations = reservationConflicts(result.error);
            if (reservations.length > 0) {
                isSaving.value = false;
                const confirmed = await confirm({
                    title: confirmTitle,
                    message: reservationsAffectedMessage(reservations.length),
                    items: reservationConflictItems(reservations, (id) => roomNames().get(id)),
                    confirmText,
                    danger: true,
                });
                if (!confirmed) return { kind: "canceled" };
                isSaving.value = true;
                result = await send(true);
            }
        }
        isSaving.value = false;

        if (result.ok) return { kind: "saved", event: result.data };
        const overlapping = eventConflicts(result.error);
        if (overlapping.length > 0) return { kind: "overlap", events: overlapping };
        return { kind: "failed", error: result.error };
    }

    return { save, isSaving };
}
