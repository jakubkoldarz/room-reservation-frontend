import { ref } from "vue";
import apiClient from "@/api/client";
import { apiCall, type ApiResult } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { useConfirm, usePrompt } from "@/features/modal/composables/useConfirm";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { ToastOptions } from "@/features/toasts/types";
import { REASON_MAX_LENGTH } from "../schemas";
import type { Reservation } from "../types";
import { formatReservationDate, formatReservationTime } from "../utils/reservationDetails";

export function useOwnReservationActions() {
    const toasts = useToastsStore();
    const confirm = useConfirm();
    const prompt = usePrompt();
    const busyId = ref<string | null>(null);

    function summary(reservation: Reservation, roomName: string): string {
        const date = formatReservationDate(reservation.date);
        const time = formatReservationTime(reservation);
        return `${roomName}, ${date}, ${time}.`;
    }

    function showResult(
        result: ApiResult<unknown>,
        failureTitle: string,
        success: ToastOptions,
    ): boolean {
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

        busyId.value = reservation.id;
        const result = await apiCall(() =>
            apiClient.deleteReservationsReservationId(undefined, { params }),
        );
        busyId.value = null;

        return showResult(result, "Failed to withdraw", {
            title: "Request withdrawn",
            message: `Request for ${roomName} was withdrawn.`,
        });
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
        const body = { reason: reason || null };

        busyId.value = reservation.id;
        const result = await apiCall(() =>
            apiClient.postReservationsReservationIdcancel(body, { params }),
        );
        busyId.value = null;

        return showResult(result, "Failed to cancel", {
            title: "Canceled",
            message: `Reservation of ${roomName} was canceled.`,
        });
    }

    return { busyId, withdraw, cancel };
}
