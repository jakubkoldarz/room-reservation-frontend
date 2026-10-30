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
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import OpenStatusLabel from "@/features/availabilities/components/OpenStatusLabel.vue";
import WeekAvailability from "@/features/availabilities/components/WeekAvailability.vue";
import { DAYS_MONDAY_FIRST, summarizeWeek } from "@/features/availabilities/utils/schedule";
import { useAllBuildings } from "@/features/buildings/composables/useAllBuildings";
import { buildingRoutes } from "@/features/buildings/routes";
import { useAllEquipment } from "@/features/equipment/composables/useAllEquipment";
import { iconFor } from "@/features/equipment/icons";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import MoreFiltersButton from "@/features/filters/components/MoreFiltersButton.vue";
import MoreFiltersPanel from "@/features/filters/components/MoreFiltersPanel.vue";
import { useMoreFilters } from "@/features/filters/composables/useMoreFilters";
import { defineFilters, type Filter } from "@/features/filters/types";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import LinkButton from "@/features/shared/LinkButton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { useRoomDestination } from "../composables/useRoomDestination";
import { roomRoutes } from "../routes";
import { RoomListQuerySchema } from "../schemas";
import { useRoomsStore } from "../stores/useRoomsStore";
import type { BasicRoom, RoomListItem } from "../types";
import {
    approvalLabel,
    approvalShortLabel,
    formatCapacity,
    formatFloor,
} from "../utils/formatRoom";
import { isConflict } from "../utils/conflicts";
import { timeRangeError, toRoomQueries } from "../utils/roomQueries";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
    { key: "room", label: "Room", align: "left" },
    { key: "building", label: "Building", width: 240, align: "left" },
    { key: "capacity", label: "Capacity", width: 130, align: "left" },
    { key: "equipment", label: "Equipment", width: 150, align: "left" },
    { key: "openDays", label: "Open days", width: 190, align: "left" },
    { key: "approval", label: "Booking", width: 90, align: "center" },
    {
        key: "delete",
        width: 65,
        align: "center",
        visible: hasPermission(Permission.RoomDelete),
    },
]);

const { buildings } = useAllBuildings();
const { equipment } = useAllEquipment();
const { dayNames } = useDate();

const dayOptions = DAYS_MONDAY_FIRST.map((day) => ({ value: String(day), label: dayNames[day] }));

const filters = computed(() =>
    defineFilters([
        { key: "identifier", type: "text", placeholder: "Room identifier" },
        ...(hasPermission(Permission.BuildingList)
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

const moreFiltersState = useMoreFilters(moreFilters, query, setFilters);
const { activeCount: activeMoreFilters, isOpen: showMoreFilters } = moreFiltersState;
const timeError = computed(() => timeRangeError(query.value));

const { data, isLoading, error, reload } = usePagedList(
    (q) => apiClient.getRooms({ queries: toRoomQueries(q, PAGE_SIZE) }),
    query,
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
    query: query.value.building ? { buildingId: query.value.building } : {},
}));

const toasts = useToastsStore();
const confirm = useConfirm();
const roomsStore = useRoomsStore();
const { roomLink } = useRoomDestination();

async function deleteRoom(room: BasicRoom): Promise<void> {
    const confirmed = await confirm({
        title: "Delete room?",
        message: `"${room.identifier}" will be permanently deleted. This cannot be undone.`,
        confirmText: "Delete",
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
        const forced = await confirm({
            title: "Delete room anyway?",
            message: `${apiErrorMessage(result.error)} Deleting anyway may affect existing reservations.`,
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
    <AsideNavbarLayout>
        <Container class="@container px-0! py-0!">
            <div
                class="border-border flex flex-col flex-wrap items-center justify-between gap-2 border-b p-4 @md:flex-row"
            >
                <div
                    class="flex w-full shrink-0 flex-col items-center gap-2 @sm:w-auto @sm:flex-row"
                >
                    <LinkButton
                        v-if="hasPermission(Permission.RoomAdd)"
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
                        controls="room-more-filters"
                        :active-count="activeMoreFilters"
                    />
                </div>
                <PagerBlock :current="query.page" :total="data?.totalPages ?? 1" />
            </div>

            <MoreFiltersPanel
                v-show="showMoreFilters"
                id="room-more-filters"
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
                :skeleton-rows="PAGE_SIZE"
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
                            <span
                                role="img"
                                :aria-label="item.name"
                                class="inline-flex cursor-help"
                            >
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
                    <span class="@3xl:hidden">{{ summarizeWeek(row.availabilities) }}</span>
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
    </AsideNavbarLayout>
</template>
