import { ref, shallowRef, watch, type Ref } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { addDays } from "@/features/rooms/utils/calendar";
import { toIsoDate } from "@/utils/isoDate";
import type { ReservationListItem } from "../types";

const MAX_PAGE_SIZE = 100;

export function useMyReservations(weekStart: Readonly<Ref<Date>>) {
    const items = shallowRef<readonly ReservationListItem[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);
    let lastRequestId = 0;

    async function load(start: Date): Promise<void> {
        const requestId = ++lastRequestId;
        isLoading.value = true;

        const result = await apiCall(() =>
            apiClient.getReservationsmine({
                queries: {
                    DateFrom: toIsoDate(start),
                    DateTo: toIsoDate(addDays(start, 6)),
                    PageSize: MAX_PAGE_SIZE,
                },
            }),
        );
        if (requestId !== lastRequestId) return;

        isLoading.value = false;
        if (result.ok) {
            items.value = result.data.items;
            error.value = null;
        } else {
            items.value = [];
            error.value = apiErrorMessage(result.error);
        }
    }

    watch(
        () => toIsoDate(weekStart.value),
        () => load(weekStart.value),
        { immediate: true },
    );

    return { items, isLoading, error, reload: () => load(weekStart.value) };
}
