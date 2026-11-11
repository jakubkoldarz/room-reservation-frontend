<script setup lang="ts">
import { computed, watch } from "vue";
import { useIntervalFn, useNow } from "@vueuse/core";
import {
    BuildingOfficeIcon,
    CalendarDaysIcon,
    ClockIcon,
    PlusIcon,
    RectangleGroupIcon,
    Square3Stack3DIcon,
    TrashIcon,
    UsersIcon,
} from "@heroicons/vue/24/solid";
import {
    CheckCircleIcon as CheckCircleOutlineIcon,
    ClockIcon as ClockOutlineIcon,
} from "@heroicons/vue/24/outline";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { useDate } from "@/composables/useDate";
import { useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { useListSort } from "@/composables/useListSort";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import OpenStatusLabel from "@/features/availabilities/components/OpenStatusLabel.vue";
import WeekAvailability from "@/features/availabilities/components/WeekAvailability.vue";
import { DAYS_MONDAY_FIRST, groupWeek } from "@/features/availabilities/utils/schedule";
import { useAllBuildings } from "@/features/buildings/composables/useAllBuildings";
import { buildingRoutes } from "@/features/buildings/routes";
import { useAllEquipment } from "@/features/equipment/composables/useAllEquipment";
import { iconFor } from "@/features/equipment/icons";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import MoreFiltersButton from "@/features/filters/components/MoreFiltersButton.vue";
import MoreFiltersPanel from "@/features/filters/components/MoreFiltersPanel.vue";
import { useMoreFilters } from "@/features/filters/composables/useMoreFilters";
import { defineFilters, type Filter } from "@/features/filters/types";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import LinkButton from "@/features/shared/LinkButton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import { toSortQueries } from "@/features/table/utils/sort";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { useRoomDestination } from "../composables/useRoomDestination";
import { roomRoutes } from "../routes";
import { RoomListQuerySchema } from "../schemas";
import { useRoomsStore } from "../stores/useRoomsStore";
import type { BasicRoom, RoomListItem } from "../types";
import {
    isConflict,
    reservationConflictItems,
    reservationConflicts,
    reservationsAffectedMessage,
} from "../utils/conflicts";
import {
    approvalLabel,
    approvalShortLabel,
    formatCapacity,
    formatFloor,
} from "../utils/formatRoom";
import { timeRangeError, toRoomQueries } from "../utils/roomQueries";

const props = withDefaults(
    defineProps<{
        buildingId?: string;
        title?: string;
        pageSize?: number;
    }>(),
    { pageSize: 25 },
);

const isBuildingScoped = computed(() => props.buildingId !== undefined);

const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
    { key: "room", label: "Room", align: "left", sortKey: "identifier" },
    {
        key: "building",
        label: "Building",
        width: 240,
        align: "left",
        sortKey: "building",
        visible: !isBuildingScoped.value,
    },
    {
        key: "floor",
        label: "Floor",
        width: 150,
        align: "left",
        sortKey: "floor",
        visible: isBuildingScoped.value,
    },
    { key: "capacity", label: "Capacity", width: 130, align: "left", sortKey: "capacity" },
    { key: "equipment", label: "Equipment", width: 175, align: "left" },
    { key: "openDays", label: "Open days", width: 190, align: "left" },
    { key: "approval", label: "Booking", width: 90, align: "center" },
    {
        key: "delete",
        width: 65,
        align: "center",
        visible: hasPermission(Permission.RoomDelete),
    },
]);

const { buildings } = useAllBuildings(() => !isBuildingScoped.value);
const { equipment } = useAllEquipment();
const { dayNames } = useDate();

const dayOptions = DAYS_MONDAY_FIRST.map((day) => ({ value: String(day), label: dayNames[day] }));

const filters = computed(() =>
    defineFilters([
        { key: "identifier", type: "text", placeholder: "Room identifier" },
        ...(!isBuildingScoped.value && hasPermission(Permission.BuildingList)
            ? [
                  {
                      key: "building",
                      type: "select",
                      placeholder: "Building",
                      icon: BuildingOfficeIcon,
                      values: buildings.value.map((b) => ({ value: b.id, label: b.name })),
                  } satisfies Filter<"building">,
              ]
            : []),
    ]),
);

const moreFilters = computed(() =>
    defineFilters([
        { key: "floor", type: "number", placeholder: "Floor", icon: Square3Stack3DIcon },
        { key: "capacity", type: "number", placeholder: "Min. capacity", icon: UsersIcon },
        ...(hasPermission(Permission.EquipmentList)
            ? [
                  {
                      key: "equipment",
                      type: "multiselect",
                      placeholder: "Has all equipment",
                      icon: RectangleGroupIcon,
                      values: equipment.value.map((e) => ({ value: e.id, label: e.name })),
                  } satisfies Filter<"equipment">,
              ]
            : []),
        {
            key: "day",
            type: "select",
            placeholder: "Open on",
            icon: CalendarDaysIcon,
            values: dayOptions,
        },
        { key: "from", type: "time", placeholder: "Open from", icon: ClockIcon },
        { key: "to", type: "time", placeholder: "Open until", icon: ClockIcon },
    ]),
);

const { query, setFilter, setFilters, clampPage } = useListQuery(RoomListQuerySchema);

const { sort, toggleSort } = useListSort(
    () => query.value.sort,
    (value) => setFilter("sort", value),
    columns,
    { by: "identifier", direction: "asc" },
);

const moreFiltersId = computed(() =>
    isBuildingScoped.value ? "building-room-more-filters" : "room-more-filters",
);
const moreFiltersState = useMoreFilters(moreFilters, query, setFilters);
const { activeCount: activeMoreFilters, isOpen: showMoreFilters } = moreFiltersState;
const timeError = computed(() => timeRangeError(query.value));

const scopedQuery = computed(() => ({
    ...query.value,
    building: props.buildingId ?? query.value.building,
}));

const { data, isLoading, error, reload } = usePagedList(
    (q) =>
        apiClient.getRooms({
            queries: { ...toRoomQueries(q, props.pageSize), ...toSortQueries(sort.value) },
        }),
    scopedQuery,
);

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });
const highlightDay = computed(() => (query.value.day === "" ? undefined : Number(query.value.day)));

function roomKey(item: RoomListItem): string {
    return item.roomInfo.id;
}

watch(data, (page) => {
    if (page) void clampPage(page.totalPages);
});

const addRoomRoute = computed(() => ({
    name: roomRoutes.add.name,
    query: scopedQuery.value.building ? { buildingId: scopedQuery.value.building } : {},
}));

const toasts = useToastsStore();
const confirm = useConfirm();
const roomsStore = useRoomsStore();
const { roomLink } = useRoomDestination();

async function deleteRoom(room: BasicRoom): Promise<void> {
    const confirmed = await confirm({
        title: "Delete room?",
        message: `You are about to delete room "${room.identifier}".`,
        warning: {
            title: "This permanently removes all data of this room:",
            points: [
                "its details, opening hours and equipment",
                "its whole reservation history, including past, rejected and canceled reservations",
                "its place in events that include it",
            ],
            note: "This can't be undone. Please continue only if you are sure this data is no longer needed.",
        },
        confirmText: "Delete room",
        danger: true,
    });
    if (!confirmed) return;

    const remove = (force: boolean) =>
        apiCall(() =>
            apiClient.deleteRoomsRoomId(undefined, {
                params: { roomId: room.id },
                queries: { force },
            }),
        );

    let result = await remove(false);
    if (!result.ok && isConflict(result.error)) {
        const reservations = reservationConflicts(result.error);
        const forced = await confirm({
            title: "Delete room anyway?",
            message:
                reservations.length > 0
                    ? `"${room.identifier}" still has upcoming reservations. ${reservationsAffectedMessage(reservations.length)}`
                    : `"${room.identifier}" still has upcoming reservations. They will be canceled and their owners notified.`,
            items: reservationConflictItems(reservations, () => room.identifier),
            confirmText: "Delete anyway",
            danger: true,
        });
        if (!forced) return;
        result = await remove(true);
    }
    if (!result.ok) {
        toasts.pushError({
            title: "Failed to delete room",
            message: apiErrorMessage(result.error),
        });
        return;
    }

    toasts.pushSuccess({ title: "Deleted", message: `Room "${room.identifier}" was deleted` });
    await reload();
    roomsStore.fetchRooms();
}
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div
            class="border-border flex flex-col flex-wrap items-center justify-between gap-2 border-b p-4 @md:flex-row"
        >
            <div class="flex w-full shrink-0 flex-col items-center gap-2 @sm:w-auto @sm:flex-row">
                <h2 v-if="title" class="self-start text-lg font-semibold @sm:self-center @sm:pr-2">
                    {{ title }}
                </h2>
                <LinkButton
                    v-if="!isBuildingScoped && hasPermission(Permission.RoomAdd)"
                    :to="addRoomRoute"
                    class="w-full rounded! py-1.5! sm:max-w-45"
                >
                    <PlusIcon />
                    Add Room
                </LinkButton>
                <FiltersPanel
                    :filters
                    :values="query"
                    class="w-full shrink-0 @sm:w-auto"
                    @change="setFilter"
                />
                <MoreFiltersButton
                    v-model="showMoreFilters"
                    :controls="moreFiltersId"
                    :active-count="activeMoreFilters"
                />
            </div>
            <PagerBlock :current="query.page" :total="data?.totalPages ?? 1" />
        </div>

        <MoreFiltersPanel
            v-show="showMoreFilters"
            :id="moreFiltersId"
            :filters="moreFilters"
            :values="query"
            :active-count="activeMoreFilters"
            @change="setFilter"
            @clear="moreFiltersState.clear"
        >
            <template #hint>
                <span :class="{ 'text-warning-text': timeError }">
                    {{ timeError ?? "Opening hours show rooms open for the whole time range." }}
                </span>
            </template>
        </MoreFiltersPanel>

        <ErrorText v-if="error" :error="apiErrorMessage(error)" class="mt-4" />

        <DataTable
            :columns
            :items="data?.items ?? []"
            :row-key="roomKey"
            :is-loading="isLoading"
            :skeleton-rows="pageSize"
            :sort
            @sort="toggleSort"
        >
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
                <OpenStatusLabel :availabilities="row.availabilities" :now />
            </template>

            <template #cell-building="{ row }">
                <TextLink
                    v-if="hasPermission(Permission.BuildingView)"
                    :to="{
                        name: buildingRoutes.view.name,
                        params: { buildingId: row.buildingInfo.id },
                    }"
                    class="block truncate"
                >
                    {{ row.buildingInfo.name }}
                </TextLink>
                <span v-else class="text-text block truncate font-medium">
                    {{ row.buildingInfo.name }}
                </span>
                <span class="text-text-muted block truncate text-xs">
                    {{ formatFloor(row.roomInfo.floor) }}
                </span>
            </template>

            <template #cell-floor="{ row }">
                <span class="inline-flex items-center gap-2 align-middle">
                    <Square3Stack3DIcon class="text-text-muted/70 size-4 shrink-0" />
                    {{ formatFloor(row.roomInfo.floor) }}
                </span>
            </template>

            <template #cell-capacity="{ row }">
                <span class="inline-flex items-center gap-2 align-middle">
                    <UsersIcon class="text-text-muted/70 size-4 shrink-0" />
                    {{ formatCapacity(row.roomInfo.capacity) }}
                </span>
            </template>

            <template #cell-equipment="{ row }">
                <span
                    v-if="row.equipment.length > 0"
                    class="hidden items-center gap-1.5 align-middle @3xl:inline-flex"
                >
                    <BaseTooltip v-for="item in row.equipment" :key="item.id" :text="item.name">
                        <span role="img" :aria-label="item.name" class="inline-flex cursor-help">
                            <component :is="iconFor(item.icon)" class="text-text/65 size-5" />
                        </span>
                    </BaseTooltip>
                </span>
                <span v-if="row.equipment.length > 0" class="@3xl:hidden">
                    {{ row.equipment.map((item) => item.name).join(", ") }}
                </span>
                <span v-else class="text-text-muted/70 text-xs">None</span>
            </template>

            <template #cell-openDays="{ row }">
                <span class="hidden @3xl:inline">
                    <WeekAvailability
                        :availabilities="row.availabilities"
                        :highlight-day="highlightDay"
                    />
                </span>
                <dl
                    v-if="groupWeek(row.availabilities).length > 0"
                    class="inline-grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 tabular-nums @3xl:hidden"
                >
                    <template v-for="group in groupWeek(row.availabilities)" :key="group.key">
                        <dt class="text-text-muted text-left">{{ group.days }}</dt>
                        <dd class="flex flex-col">
                            <span v-for="range in group.ranges" :key="range">{{ range }}</span>
                        </dd>
                    </template>
                </dl>
                <span v-else class="text-text-muted/70 text-xs @3xl:hidden"> Closed all week </span>
            </template>

            <template #cell-approval="{ row }">
                <BaseTooltip
                    :text="approvalLabel(row.roomInfo.requiresApproval)"
                    class="align-middle"
                >
                    <span
                        role="img"
                        :aria-label="approvalLabel(row.roomInfo.requiresApproval)"
                        class="inline-flex cursor-help"
                        :class="row.roomInfo.requiresApproval ? 'text-warning' : 'text-success'"
                    >
                        <ClockOutlineIcon v-if="row.roomInfo.requiresApproval" class="size-5" />
                        <CheckCircleOutlineIcon v-else class="size-5" />
                    </span>
                    <span
                        class="ml-1.5 @3xl:hidden"
                        :class="
                            row.roomInfo.requiresApproval ? 'text-warning-text' : 'text-success'
                        "
                    >
                        {{ approvalShortLabel(row.roomInfo.requiresApproval) }}
                    </span>
                </BaseTooltip>
            </template>

            <template #cell-delete="{ row }">
                <IconButton type="danger" @click="deleteRoom(row.roomInfo)">
                    <TrashIcon class="size-4" />
                </IconButton>
            </template>
        </DataTable>
    </Container>
</template>
