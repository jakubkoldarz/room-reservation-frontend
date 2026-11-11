<script setup lang="ts">
import { NoSymbolIcon, TagIcon, ClockIcon, TrashIcon } from "@heroicons/vue/24/solid";
import { useIntervalFn, useNow } from "@vueuse/core";
import { computed, ref, watch } from "vue";
import apiClient from "@/api/client";
import { apiCall, type ApiResult } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import { defineFilters, type Filter } from "@/features/filters/types";
import { useConfirm, usePrompt } from "@/features/modal/composables/useConfirm";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import ReservationStatusChip from "@/features/reservations/components/ReservationStatusChip.vue";
import { REASON_MAX_LENGTH } from "@/features/reservations/schemas";
import type { ReservationListItem } from "@/features/reservations/types";
import {
    formatReservationDate,
    formatReservationTime,
} from "@/features/reservations/utils/reservationDetails";
import { RESERVATION_STATES } from "@/features/reservations/utils/reservationQueries";
import {
    getReservationState,
    reservationStateLabel,
} from "@/features/reservations/utils/reservationState";
import { useRoomDestination } from "@/features/rooms/composables/useRoomDestination";
import { formatFloor } from "@/features/rooms/utils/formatRoom";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import type { Column } from "@/features/table/types";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { MyReservationsQuerySchema } from "../schemas";
import { myReservationAction, toMyReservationQueries } from "../utils/myReservations";

const PAGE_SIZE = 20;

const columns: Column[] = [
    { key: "when", label: "Date", width: 200, align: "left" },
    { key: "room", label: "Room", width: 220, align: "left" },
    { key: "purpose", label: "Purpose", align: "left" },
    { key: "status", label: "Status", width: 190, align: "left" },
    { key: "actions", width: 70, align: "center" },
];

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });
const { query, setFilter, clampPage } = useListQuery(MyReservationsQuerySchema);

const filters = defineFilters([
    {
        key: "when",
        type: "select",
        placeholder: "Period",
        icon: ClockIcon,
        values: [
            { value: "upcoming", label: "Today and upcoming" },
            { value: "past", label: "Past" },
            { value: "all", label: "All" },
        ],
    } satisfies Filter<"when">,
    {
        key: "status",
        type: "select",
        placeholder: "Status",
        icon: TagIcon,
        values: RESERVATION_STATES.map((state) => ({
            value: state,
            label: reservationStateLabel(state),
        })),
    } satisfies Filter<"status">,
]);

const { data, isLoading, error, reload } = usePagedList(
    (q) =>
        apiClient.getReservationsmine({
            queries: toMyReservationQueries(q, PAGE_SIZE, new Date()),
        }),
    query,
);

watch(data, (page) => {
    if (page) void clampPage(page.totalPages);
});

const periodNotice = computed(() => {
    if (query.value.when === "past") return "Showing reservations that have already passed.";
    if (query.value.when === "all") return null;
    return "Showing today's and upcoming reservations.";
});

function reservationKey(item: ReservationListItem): string {
    return item.reservationInfo.id;
}

function stateOf(item: ReservationListItem) {
    return getReservationState(item.reservationInfo, item.roomInfo.requiresApproval);
}

function actionOf(item: ReservationListItem) {
    return myReservationAction(stateOf(item), item.reservationInfo, now.value);
}

function summary(item: ReservationListItem): string {
    return `${item.roomInfo.identifier}, ${formatReservationDate(item.reservationInfo.date)}, ${formatReservationTime(item.reservationInfo)}.`;
}

const { roomLink } = useRoomDestination();
const toasts = useToastsStore();
const confirm = useConfirm();
const prompt = usePrompt();
const busyId = ref<string | null>(null);

async function runAction(
    item: ReservationListItem,
    action: () => Promise<ApiResult<unknown>>,
    success: { title: string; message: string },
    failureTitle: string,
): Promise<void> {
    busyId.value = item.reservationInfo.id;
    const result = await action();
    busyId.value = null;

    if (!result.ok) {
        toasts.pushError({ title: failureTitle, message: apiErrorMessage(result.error) });
        return;
    }
    toasts.pushSuccess(success);
    await reload();
}

async function withdraw(item: ReservationListItem): Promise<void> {
    const confirmed = await confirm({
        title: "Withdraw request?",
        message: `${summary(item)} The request will be removed.`,
        confirmText: "Withdraw",
        cancelText: "Keep",
        danger: true,
    });
    if (!confirmed) return;

    const params = { reservationId: item.reservationInfo.id };
    await runAction(
        item,
        () => apiCall(() => apiClient.deleteReservationsReservationId(undefined, { params })),
        {
            title: "Request withdrawn",
            message: `Request for ${item.roomInfo.identifier} was withdrawn.`,
        },
        "Failed to withdraw",
    );
}

async function cancel(item: ReservationListItem): Promise<void> {
    const reason = await prompt({
        title: "Cancel reservation?",
        message: summary(item),
        confirmText: "Cancel reservation",
        cancelText: "Keep",
        danger: true,
        input: { label: "Reason (optional)", maxLength: REASON_MAX_LENGTH },
    });
    if (reason === null) return;

    const params = { reservationId: item.reservationInfo.id };
    await runAction(
        item,
        () =>
            apiCall(() =>
                apiClient.postReservationsReservationIdcancel(
                    { reason: reason || null },
                    { params },
                ),
            ),
        { title: "Canceled", message: `Reservation of ${item.roomInfo.identifier} was canceled.` },
        "Failed to cancel",
    );
}
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div
            class="border-border flex flex-col flex-wrap items-center justify-between gap-2 border-b p-4 @md:flex-row"
        >
            <FiltersPanel
                :filters
                :values="query"
                class="w-full shrink-0 @sm:w-auto"
                @change="setFilter"
            />
            <PagerBlock :current="query.page" :total="data?.totalPages ?? 1" />
        </div>

        <p
            v-if="periodNotice"
            class="border-border bg-background text-text-muted border-b px-4 py-2 text-sm"
        >
            {{ periodNotice }}
        </p>

        <ErrorText v-if="error" :error="apiErrorMessage(error)" class="mt-4" />

        <DataTable
            :columns
            :items="data?.items ?? []"
            :row-key="reservationKey"
            :is-loading="isLoading"
            :skeleton-rows="PAGE_SIZE"
        >
            <template #cell-when="{ row }">
                <span class="text-text block truncate font-medium">
                    {{ formatReservationDate(row.reservationInfo.date) }}
                </span>
                <span class="text-text-muted block truncate text-xs tabular-nums">
                    {{ formatReservationTime(row.reservationInfo) }}
                </span>
            </template>

            <template #cell-room="{ row }">
                <TextLink
                    v-if="roomLink(row.roomInfo.id)"
                    :to="roomLink(row.roomInfo.id)!"
                    class="block truncate"
                >
                    {{ row.roomInfo.identifier }}
                </TextLink>
                <span v-else class="text-text block truncate font-medium">
                    {{ row.roomInfo.identifier }}
                </span>
                <span class="text-text-muted block truncate text-xs">
                    {{ row.buildingInfo.name }} · {{ formatFloor(row.roomInfo.floor) }}
                </span>
            </template>

            <template #cell-purpose="{ row }">
                <span v-if="row.reservationInfo.purpose" class="text-text block truncate">
                    {{ row.reservationInfo.purpose }}
                </span>
                <span v-else class="text-text-muted/70 block text-xs">No purpose</span>
                <span
                    v-if="row.reservationInfo.reason"
                    class="text-text-muted block truncate text-xs"
                >
                    Reason: {{ row.reservationInfo.reason }}
                </span>
            </template>

            <template #cell-status="{ row }">
                <ReservationStatusChip :state="stateOf(row)" />
            </template>

            <template #cell-actions="{ row }">
                <BaseTooltip v-if="actionOf(row) === 'withdraw'" text="Withdraw request">
                    <IconButton
                        type="danger"
                        aria-label="Withdraw request"
                        :disabled="busyId === row.reservationInfo.id"
                        @click="withdraw(row)"
                    >
                        <TrashIcon class="size-4" />
                    </IconButton>
                </BaseTooltip>
                <BaseTooltip v-else-if="actionOf(row) === 'cancel'" text="Cancel reservation">
                    <IconButton
                        type="warning"
                        aria-label="Cancel reservation"
                        :disabled="busyId === row.reservationInfo.id"
                        @click="cancel(row)"
                    >
                        <NoSymbolIcon class="size-4" />
                    </IconButton>
                </BaseTooltip>
            </template>
        </DataTable>
    </Container>
</template>
