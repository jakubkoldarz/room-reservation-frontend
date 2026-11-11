import { ref } from "vue";
import apiClient from "@/api/client";
import { apiCall, type ApiResult } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { useConfirm, usePrompt } from "@/features/modal/composables/useConfirm";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { REASON_MAX_LENGTH } from "../schemas";
import type { Reservation } from "../types";
import { formatReservationDate, formatReservationTime } from "../utils/reservationDetails";

export function useOwnReservationActions() {
    const toasts = useToastsStore();
    const confirm = useConfirm();
    const prompt = usePrompt();
    const busyId = ref<string | null>(null);

    function summary(reservation: Reservation, roomName: string): string {
        return `${roomName}, ${formatReservationDate(reservation.date)}, ${formatReservationTime(reservation)}.`;
    }

    async function run(
        reservation: Reservation,
        action: () => Promise<ApiResult<unknown>>,
        success: { title: string; message: string },
        failureTitle: string,
    ): Promise<boolean> {
        busyId.value = reservation.id;
        const result = await action();
        busyId.value = null;

        if (!result.ok) {
            toasts.pushError({ title: failureTitle, message: apiErrorMessage(result.error) });
            return false;
        }
        toasts.pushSuccess(success);
        return true;
    }

    async function withdraw(reservation: Reservation, roomName: string): Promise<boolean> {
        const confirmed = await confirm({
            title: "Withdraw request?",
            message: `${summary(reservation, roomName)} The request will be removed.`,
            confirmText: "Withdraw",
            cancelText: "Keep",
            danger: true,
        });
        if (!confirmed) return false;

        const params = { reservationId: reservation.id };
        return run(
            reservation,
            () => apiCall(() => apiClient.deleteReservationsReservationId(undefined, { params })),
            { title: "Request withdrawn", message: `Request for ${roomName} was withdrawn.` },
            "Failed to withdraw",
        );
    }

    async function cancel(reservation: Reservation, roomName: string): Promise<boolean> {
        const reason = await prompt({
            title: "Cancel reservation?",
            message: summary(reservation, roomName),
            confirmText: "Cancel reservation",
            cancelText: "Keep",
            danger: true,
            input: { label: "Reason (optional)", maxLength: REASON_MAX_LENGTH },
        });
        if (reason === null) return false;

        const params = { reservationId: reservation.id };
        return run(
            reservation,
            () =>
                apiCall(() =>
                    apiClient.postReservationsReservationIdcancel(
                        { reason: reason || null },
                        { params },
                    ),
                ),
            { title: "Canceled", message: `Reservation of ${roomName} was canceled.` },
            "Failed to cancel",
        );
    }

    return { busyId, withdraw, cancel };
}
