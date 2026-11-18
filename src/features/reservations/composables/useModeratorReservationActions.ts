import { ref } from "vue";
import apiClient from "@/api/client";
import { apiCall, type ApiResult } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { useConfirm, usePrompt } from "@/features/modal/composables/useConfirm";
import type { ConfirmItem } from "@/features/modal/types";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { ToastOptions } from "@/features/toasts/types";
import { REASON_MAX_LENGTH } from "../schemas";
import type { Reservation } from "../types";
import { formatReservationDate, formatReservationTime } from "../utils/reservationDetails";
import { rangesOverlap } from "../utils/reservationOverlap";
import { reservationStatusCode } from "../utils/reservationQueries";
import { formatUserName } from "../utils/reservationState";

export function useModeratorReservationActions() {
    const toasts = useToastsStore();
    const confirm = useConfirm();
    const prompt = usePrompt();
    const busyId = ref<string | null>(null);

    function summary(reservation: Reservation, roomName: string): string {
        const date = formatReservationDate(reservation.date);
        const time = formatReservationTime(reservation);
        const author = formatUserName(reservation.createdBy.by);
        return `${roomName}, ${date}, ${time}, booked by ${author}.`;
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

    async function overlappingRequests(
        reservation: Reservation,
        roomId: string,
    ): Promise<Reservation[]> {
        const queries = {
            RoomId: roomId,
            Date: reservation.date,
            Status: reservationStatusCode("pending"),
            PageSize: 100,
        };
        const result = await apiCall(() => apiClient.getReservations({ queries }));
        if (!result.ok) return [];

        const overlapping: Reservation[] = [];
        for (const item of result.data.items) {
            const other = item.reservationInfo;
            if (other.id === reservation.id) continue;
            if (!rangesOverlap(other, reservation)) continue;
            overlapping.push(other);
        }
        return overlapping;
    }

    function requestItem(reservation: Reservation): ConfirmItem {
        const time = formatReservationTime(reservation);
        const author = formatUserName(reservation.createdBy.by);
        let purpose = "No purpose";
        if (reservation.purpose) purpose = reservation.purpose;
        return { primary: `${time} · ${author}`, secondary: purpose };
    }

    function approveMessage(
        reservation: Reservation,
        roomName: string,
        overlapCount: number,
    ): string {
        const details = summary(reservation, roomName);
        if (overlapCount === 0) {
            return `${details} The person who booked it will get an email.`;
        }
        let requests = `${overlapCount} overlapping requests`;
        if (overlapCount === 1) requests = "1 overlapping request";
        return `${details} ${requests} for this time will be rejected automatically. Everyone involved will get an email.`;
    }

    function approvedMessage(roomName: string, rejectedCount: number): string {
        const approved = `Reservation of ${roomName} was approved.`;
        if (rejectedCount === 0) return approved;
        if (rejectedCount === 1) return `${approved} 1 overlapping request was rejected.`;
        return `${approved} ${rejectedCount} overlapping requests were rejected.`;
    }

    async function approve(
        reservation: Reservation,
        roomId: string,
        roomName: string,
    ): Promise<boolean> {
        busyId.value = reservation.id;
        const overlapping = await overlappingRequests(reservation, roomId);
        busyId.value = null;

        const items: ConfirmItem[] = [];
        for (const other of overlapping) {
            items.push(requestItem(other));
        }

        const confirmed = await confirm({
            title: "Approve reservation?",
            message: approveMessage(reservation, roomName, overlapping.length),
            items,
            confirmText: "Approve",
        });
        if (!confirmed) return false;

        const params = { reservationId: reservation.id };

        busyId.value = reservation.id;
        const result = await apiCall(() =>
            apiClient.postReservationsReservationIdapprove(undefined, { params }),
        );
        busyId.value = null;

        return showResult(result, "Failed to approve", {
            title: "Approved",
            message: approvedMessage(roomName, overlapping.length),
        });
    }

    async function reject(reservation: Reservation, roomName: string): Promise<boolean> {
        const reason = await prompt({
            title: "Reject reservation?",
            message: `${summary(reservation, roomName)} The person who booked it will get an email.`,
            confirmText: "Reject",
            danger: true,
            input: { label: "Reason (optional)", maxLength: REASON_MAX_LENGTH },
        });
        if (reason === null) return false;

        const params = { reservationId: reservation.id };
        const body = { reason: reason || null };

        busyId.value = reservation.id;
        const result = await apiCall(() =>
            apiClient.postReservationsReservationIdreject(body, { params }),
        );
        busyId.value = null;

        return showResult(result, "Failed to reject", {
            title: "Rejected",
            message: `Reservation of ${roomName} was rejected.`,
        });
    }

    async function forceCancel(reservation: Reservation, roomName: string): Promise<boolean> {
        const reason = await prompt({
            title: "Cancel reservation?",
            message: `${summary(reservation, roomName)} The person who booked it will get an email.`,
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
            apiClient.postReservationsReservationIdforceCancel(body, { params }),
        );
        busyId.value = null;

        return showResult(result, "Failed to cancel", {
            title: "Canceled",
            message: `Reservation of ${roomName} was canceled.`,
        });
    }

    return { busyId, approve, reject, forceCancel };
}
