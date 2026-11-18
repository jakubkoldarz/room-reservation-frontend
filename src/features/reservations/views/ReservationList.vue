<script setup lang="ts">
import { useIntervalFn, useNow } from "@vueuse/core";
import { computed, watch } from "vue";
import {
    BuildingOfficeIcon,
    CalendarDaysIcon,
    CheckIcon,
    ClockIcon,
    NoSymbolIcon,
    RectangleStackIcon,
    TagIcon,
    UserIcon,
    XMarkIcon,
} from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiErrorMessage } from "@/api/errors";
import { useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { useListSort } from "@/composables/useListSort";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import { useAllBuildings } from "@/features/buildings/composables/useAllBuildings";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import MoreFiltersButton from "@/features/filters/components/MoreFiltersButton.vue";
import MoreFiltersPanel from "@/features/filters/components/MoreFiltersPanel.vue";
import { useMoreFilters } from "@/features/filters/composables/useMoreFilters";
import type { Filter } from "@/features/filters/types";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import { useAllRooms } from "@/features/rooms/composables/useAllRooms";
import { useRoomDestination } from "@/features/rooms/composables/useRoomDestination";
import { formatFloor } from "@/features/rooms/utils/formatRoom";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import { toSortQueries } from "@/features/table/utils/sort";
import { useAllUsers } from "@/features/users/composables/useAllUsers";
import ReservationStatusChip from "../components/ReservationStatusChip.vue";
import { ReservationListQuerySchema } from "../schemas";
import { useModeratorReservationActions } from "../composables/useModeratorReservationActions";
import type { ReservationListItem } from "../types";
import { hasStarted } from "../utils/reservationActions";
import {
    formatActionTime,
    formatReservationDate,
    formatReservationTime,
} from "../utils/reservationDetails";
import {
    isPastFirst,
    RESERVATION_PERIOD_OPTIONS,
    RESERVATION_STATES,
    toReservationQueries,
} from "../utils/reservationQueries";
import {
    formatUserName,
    getReservationState,
    reservationStateLabel,
} from "../utils/reservationState";

type ReservationFilterKey = "when" | "status" | "date" | "building";
type ReservationMoreFilterKey = "room" | "createdBy" | "approvedBy" | "canceledBy";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();
const canApprove = hasPermission(Permission.ReservationApprove);
const canReject = hasPermission(Permission.ReservationReject);
const canCancel = hasPermission(Permission.ReservationForceCancel);

const columns = useVisibleColumns(() => [
    { key: "when", label: "Date", width: 200, align: "left", sortKey: "date" },
    { key: "room", label: "Room", width: 210, align: "left", sortKey: "room" },
    { key: "bookedBy", label: "Booked by", width: 200, align: "left", sortKey: "createdBy" },
    { key: "purpose", label: "Purpose", align: "left" },
    { key: "status", label: "Status", width: 180, align: "left", sortKey: "status" },
    {
        key: "actions",
        width: 110,
        align: "center",
        visible: canApprove || canReject || canCancel,
    },
]);

const { buildings } = useAllBuildings();
const { rooms } = useAllRooms();
const { users } = useAllUsers();

const { query, setFilter, setFilters, clampPage } = useListQuery(ReservationListQuerySchema);

const { sort, toggleSort } = useListSort(
    () => query.value.sort,
    (value) => setFilter("sort", value),
    columns,
    () => ({
        by: "date",
        direction: isPastFirst(query.value.when) && !query.value.date ? "desc" : "asc",
    }),
);

const statusOptions = RESERVATION_STATES.map((state) => ({
    value: state,
    label: reservationStateLabel(state),
}));
const userOptions = computed(() =>
    users.value.map((user) => ({ value: user.id, label: formatUserName(user) })),
);
const roomOptions = computed(() =>
    rooms.value
        .filter((room) => !query.value.building || room.buildingInfo.id === query.value.building)
        .map((room) => ({
            value: room.roomInfo.id,
            label: `${room.roomInfo.identifier} · ${room.buildingInfo.name}`,
        })),
);

const filters = computed(() => {
    const list: Filter<ReservationFilterKey>[] = [
        {
            key: "when",
            type: "select",
            placeholder: "Period",
            icon: ClockIcon,
            values: RESERVATION_PERIOD_OPTIONS,
        },
        {
            key: "status",
            type: "select",
            placeholder: "Status",
            icon: TagIcon,
            values: statusOptions,
        },
        { key: "date", type: "date", placeholder: "Date", icon: CalendarDaysIcon },
    ];
    if (hasPermission(Permission.BuildingList)) {
        list.push({
            key: "building",
            type: "select",
            placeholder: "Building",
            icon: BuildingOfficeIcon,
            values: buildings.value.map((b) => ({ value: b.id, label: b.name })),
        });
    }
    return list;
});

const moreFilters = computed(() => {
    const list: Filter<ReservationMoreFilterKey>[] = [];
    if (hasPermission(Permission.RoomList)) {
        list.push({
            key: "room",
            type: "select",
            placeholder: "Room",
            icon: RectangleStackIcon,
            values: roomOptions.value,
        });
    }
    if (hasPermission(Permission.UserList)) {
        list.push({
            key: "createdBy",
            type: "select",
            placeholder: "Booked by",
            icon: UserIcon,
            values: userOptions.value,
        });
        list.push({
            key: "approvedBy",
            type: "select",
            placeholder: "Approved by",
            icon: UserIcon,
            values: userOptions.value,
        });
        list.push({
            key: "canceledBy",
            type: "select",
            placeholder: "Canceled by",
            icon: UserIcon,
            values: userOptions.value,
        });
    }
    return list;
});

const moreFiltersState = useMoreFilters(moreFilters, query, setFilters);
const { activeCount: activeMoreFilters, isOpen: showMoreFilters } = moreFiltersState;

const { data, isLoading, error, reload } = usePagedList(
    (q) =>
        apiClient.getReservations({
            queries: {
                ...toReservationQueries(q, PAGE_SIZE, new Date()),
                ...toSortQueries(sort.value),
            },
        }),
    query,
);

watch(data, async (page) => {
    if (page) await clampPage(page.totalPages);
});

const periodNotice = computed(() => {
    if (query.value.date) return null;
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

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });

function canModerate(item: ReservationListItem): boolean {
    return !hasStarted(item.reservationInfo, now.value);
}

function formatTimeRange(item: ReservationListItem): string {
    return formatReservationTime(item.reservationInfo);
}

const { roomLink } = useRoomDestination();
const moderator = useModeratorReservationActions();
const busyId = moderator.busyId;

async function approve(item: ReservationListItem): Promise<void> {
    const room = item.roomInfo;
    const approved = await moderator.approve(item.reservationInfo, room.id, room.identifier);
    if (approved) await reload();
}

async function reject(item: ReservationListItem): Promise<void> {
    const rejected = await moderator.reject(item.reservationInfo, item.roomInfo.identifier);
    if (rejected) await reload();
}

async function forceCancel(item: ReservationListItem): Promise<void> {
    const canceled = await moderator.forceCancel(item.reservationInfo, item.roomInfo.identifier);
    if (canceled) await reload();
}
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div
            class="border-border flex flex-col flex-wrap items-center justify-between gap-2 border-b p-4 @md:flex-row"
        >
            <div class="flex w-full shrink-0 flex-col items-center gap-2 @sm:w-auto @sm:flex-row">
                <FiltersPanel
                    :filters
                    :values="query"
                    class="w-full shrink-0 @sm:w-auto"
                    @change="setFilter"
                />
                <MoreFiltersButton
                    v-if="moreFilters.length > 0"
                    v-model="showMoreFilters"
                    controls="reservation-more-filters"
                    :active-count="activeMoreFilters"
                />
            </div>
            <PagerBlock :current="query.page" :total="data?.totalPages ?? 1" />
        </div>

        <MoreFiltersPanel
            v-if="moreFilters.length > 0"
            v-show="showMoreFilters"
            id="reservation-more-filters"
            :filters="moreFilters"
            :values="query"
            :active-count="activeMoreFilters"
            @change="setFilter"
            @clear="moreFiltersState.clear"
        />

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
                    {{ formatTimeRange(row) }}
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

            <template #cell-bookedBy="{ row }">
                <span class="text-text block truncate">
                    {{ formatUserName(row.reservationInfo.createdBy.by) }}
                </span>
                <span class="text-text-muted block truncate text-xs">
                    Booked {{ formatActionTime(row.reservationInfo.createdBy.at) }}
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
                <span v-if="canModerate(row)" class="inline-flex items-center gap-1.5 align-middle">
                    <template v-if="stateOf(row) === 'pending'">
                        <BaseTooltip v-if="canApprove" text="Approve">
                            <IconButton
                                type="success"
                                aria-label="Approve"
                                :disabled="busyId === row.reservationInfo.id"
                                @click="approve(row)"
                            >
                                <CheckIcon class="size-4" />
                            </IconButton>
                        </BaseTooltip>
                        <BaseTooltip v-if="canReject" text="Reject">
                            <IconButton
                                type="danger"
                                aria-label="Reject"
                                :disabled="busyId === row.reservationInfo.id"
                                @click="reject(row)"
                            >
                                <XMarkIcon class="size-4" />
                            </IconButton>
                        </BaseTooltip>
                    </template>
                    <BaseTooltip
                        v-else-if="stateOf(row) === 'approved' && canCancel"
                        text="Cancel reservation"
                    >
                        <IconButton
                            type="warning"
                            aria-label="Cancel reservation"
                            :disabled="busyId === row.reservationInfo.id"
                            @click="forceCancel(row)"
                        >
                            <NoSymbolIcon class="size-4" />
                        </IconButton>
                    </BaseTooltip>
                </span>
            </template>
        </DataTable>
    </Container>
</template>
