<script setup lang="ts">
import {
    ClockIcon,
    NoSymbolIcon,
    PencilSquareIcon,
    TagIcon,
    TrashIcon,
} from "@heroicons/vue/24/solid";
import { useIntervalFn, useNow } from "@vueuse/core";
import { computed, watch } from "vue";
import apiClient from "@/api/client";
import { apiErrorMessage } from "@/api/errors";
import { useListQuery } from "@/composables/useListQuery";
import { useListSort } from "@/composables/useListSort";
import { usePermissions } from "@/composables/usePermissions";
import { usePagedList } from "@/composables/usePagedList";
import { Permission } from "@/features/auth/constants/permissions";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import { defineFilters, type Filter } from "@/features/filters/types";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import ReservationStatusChip from "@/features/reservations/components/ReservationStatusChip.vue";
import { useOwnReservationActions } from "@/features/reservations/composables/useOwnReservationActions";
import { reservationRoutes } from "@/features/reservations/routes";
import type { ReservationListItem } from "@/features/reservations/types";
import { ownReservationActions } from "@/features/reservations/utils/reservationActions";
import {
    formatReservationDate,
    formatReservationTime,
} from "@/features/reservations/utils/reservationDetails";
import {
    isPastFirst,
    RESERVATION_PERIOD_OPTIONS,
    RESERVATION_STATES,
} from "@/features/reservations/utils/reservationQueries";
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
import { toSortQueries } from "@/features/table/utils/sort";
import { MyReservationsQuerySchema } from "../schemas";
import { toMyReservationQueries } from "../utils/myReservations";

const PAGE_SIZE = 20;

const { hasPermission } = usePermissions();

const columns: Column[] = [
    { key: "when", label: "Date", width: 200, align: "left", sortKey: "date" },
    { key: "room", label: "Room", width: 220, align: "left", sortKey: "room" },
    { key: "purpose", label: "Purpose", align: "left" },
    { key: "status", label: "Status", width: 190, align: "left", sortKey: "status" },
    { key: "actions", width: 100, align: "center" },
];

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });
const { query, setFilter, clampPage } = useListQuery(MyReservationsQuerySchema);

const { sort, toggleSort } = useListSort(
    () => query.value.sort,
    (value) => setFilter("sort", value),
    columns,
    () => ({
        by: "date",
        direction: isPastFirst(query.value.when) ? "desc" : "asc",
    }),
);

const filters = defineFilters([
    {
        key: "when",
        type: "select",
        placeholder: "Period",
        icon: ClockIcon,
        values: RESERVATION_PERIOD_OPTIONS,
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
            queries: {
                ...toMyReservationQueries(q, PAGE_SIZE, new Date()),
                ...toSortQueries(sort.value),
            },
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

const canOpenReservation = hasPermission(Permission.ReservationView);

function actionsOf(item: ReservationListItem) {
    return ownReservationActions(stateOf(item), item.reservationInfo, now.value);
}

function editLink(item: ReservationListItem) {
    return {
        name: reservationRoutes.edit.name,
        params: { reservationId: item.reservationInfo.id },
    };
}

const { roomLink } = useRoomDestination();
const {
    busyId,
    withdraw: withdrawReservation,
    cancel: cancelReservation,
} = useOwnReservationActions();

async function withdraw(item: ReservationListItem): Promise<void> {
    if (await withdrawReservation(item.reservationInfo, item.roomInfo.identifier)) await reload();
}

async function cancel(item: ReservationListItem): Promise<void> {
    if (await cancelReservation(item.reservationInfo, item.roomInfo.identifier)) await reload();
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
            :sort
            @sort="toggleSort"
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
                <span class="inline-flex items-center gap-1.5 align-middle">
                    <BaseTooltip
                        v-if="canOpenReservation && actionsOf(row).includes('edit')"
                        text="Edit reservation"
                    >
                        <RouterLink
                            :to="editLink(row)"
                            aria-label="Edit reservation"
                            class="border-border text-text-muted hover:text-primary hover:border-primary/40 focus-visible:ring-primary inline-flex rounded-lg border p-0.5 transition-all outline-none focus-visible:ring-1"
                        >
                            <PencilSquareIcon class="size-4" />
                        </RouterLink>
                    </BaseTooltip>
                    <BaseTooltip v-if="actionsOf(row).includes('withdraw')" text="Withdraw request">
                        <IconButton
                            type="danger"
                            aria-label="Withdraw request"
                            :disabled="busyId === row.reservationInfo.id"
                            @click="withdraw(row)"
                        >
                            <TrashIcon class="size-4" />
                        </IconButton>
                    </BaseTooltip>
                    <BaseTooltip v-if="actionsOf(row).includes('cancel')" text="Cancel reservation">
                        <IconButton
                            type="warning"
                            aria-label="Cancel reservation"
                            :disabled="busyId === row.reservationInfo.id"
                            @click="cancel(row)"
                        >
                            <NoSymbolIcon class="size-4" />
                        </IconButton>
                    </BaseTooltip>
                </span>
            </template>
        </DataTable>
    </Container>
</template>
