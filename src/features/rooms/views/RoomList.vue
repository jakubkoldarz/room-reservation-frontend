<script setup lang="ts">
import { computed, ref, watch } from "vue";
import {
    AdjustmentsHorizontalIcon,
    BuildingOfficeIcon,
    CalendarDaysIcon,
    ChevronDownIcon,
    ClockIcon,
    PlusIcon,
    RectangleGroupIcon,
    Square3Stack3DIcon,
    TrashIcon,
    UsersIcon,
} from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { useDate } from "@/composables/useDate";
import { useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import { useAllBuildings } from "@/features/buildings/composables/useAllBuildings";
import { useAllEquipment } from "@/features/equipment/composables/useAllEquipment";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import { defineFilters, type Filter } from "@/features/filters/types";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import Badge from "@/features/shared/Badge.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import LinkButton from "@/features/shared/LinkButton.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { roomRoutes } from "../routes";
import { RoomListQuerySchema } from "../schemas";
import { useRoomsStore } from "../stores/useRoomsStore";
import type { BasicRoom } from "../types";
import { timeRangeError, toRoomQueries } from "../utils/roomQueries";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
    { key: "identifier", label: "Identifier", align: "left" },
    { key: "floor", label: "Floor", width: 100, align: "center" },
    { key: "capacity", label: "Capacity", width: 120, align: "center" },
    { key: "approval", label: "Approval", width: 160, align: "center" },
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

const MONDAY_FIRST = [1, 2, 3, 4, 5, 6, 0];
const dayOptions = MONDAY_FIRST.map((day) => ({ value: String(day), label: dayNames[day] }));

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

const activeMoreFilters = computed(
    () => moreFilters.value.filter((filter) => query.value[filter.key] !== "").length,
);
const showMoreFilters = ref(activeMoreFilters.value > 0);
const timeError = computed(() => timeRangeError(query.value));

function clearMoreFilters(): Promise<void> {
    return setFilters({ floor: "", capacity: "", equipment: "", day: "", from: "", to: "" });
}

const { data, isLoading, error, reload } = usePagedList(
    (q) => apiClient.getRooms({ queries: toRoomQueries(q, PAGE_SIZE) }),
    query,
);

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

async function deleteRoom(room: BasicRoom): Promise<void> {
    const confirmed = await confirm({
        title: "Delete room?",
        message: `"${room.identifier}" will be permanently deleted. This cannot be undone.`,
        confirmText: "Delete",
        danger: true,
    });
    if (!confirmed) return;

    const result = await apiCall(() =>
        apiClient.deleteRoomsRoomId(undefined, { params: { roomId: room.id } }),
    );
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
                    <button
                        type="button"
                        aria-controls="room-more-filters"
                        :aria-expanded="showMoreFilters"
                        class="focus-visible:ring-primary flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded border px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2 @sm:w-auto"
                        :class="
                            showMoreFilters || activeMoreFilters > 0
                                ? 'border-primary/30 bg-primary/10 text-primary'
                                : 'border-border text-text-muted hover:border-primary/30 hover:text-primary'
                        "
                        @click="showMoreFilters = !showMoreFilters"
                    >
                        <AdjustmentsHorizontalIcon class="size-4" />
                        More filters
                        <span
                            v-if="activeMoreFilters > 0"
                            class="bg-primary text-surface rounded-full px-1.5 text-xs font-bold"
                        >
                            {{ activeMoreFilters }}
                        </span>
                        <ChevronDownIcon
                            class="size-4 transition-transform"
                            :class="{ 'rotate-180': showMoreFilters }"
                        />
                    </button>
                </div>
                <PagerBlock :current="query.page" :total="data?.totalPages ?? 1" />
            </div>

            <div
                v-show="showMoreFilters"
                id="room-more-filters"
                class="border-border bg-background/50 flex flex-col gap-3 border-b p-4"
            >
                <FiltersPanel
                    layout="grid"
                    :filters="moreFilters"
                    :values="query"
                    @change="setFilter"
                />
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="text-text-muted text-xs" :class="{ 'text-warning-text!': timeError }">
                        {{ timeError ?? "Opening hours show rooms open for the whole time range." }}
                    </p>
                    <button
                        type="button"
                        class="text-primary cursor-pointer text-sm font-medium hover:underline disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:no-underline"
                        :disabled="activeMoreFilters === 0"
                        @click="clearMoreFilters"
                    >
                        Clear filters
                    </button>
                </div>
            </div>

            <ErrorText v-if="error" :error="apiErrorMessage(error)" class="mt-4" />

            <DataTable
                :columns
                :items="data?.items ?? []"
                row-key="id"
                :is-loading="isLoading"
                :skeleton-rows="PAGE_SIZE"
            >
                <template #cell-identifier="{ row }">
                    <Badge class="inline-flex!">{{ row.identifier }}</Badge>
                </template>

                <template #cell-floor="{ row }">
                    {{ row.floor }}
                </template>

                <template #cell-capacity="{ row }">
                    {{ row.capacity }}
                </template>

                <template #cell-approval="{ row }">
                    <Badge
                        :type="row.requiresApproval ? 'warning' : 'success'"
                        class="inline-flex!"
                    >
                        {{ row.requiresApproval ? "Required" : "Not required" }}
                    </Badge>
                </template>

                <template #cell-delete="{ row }">
                    <IconButton type="danger" @click="deleteRoom(row)">
                        <TrashIcon class="size-4" />
                    </IconButton>
                </template>
            </DataTable>
        </Container>
    </AsideNavbarLayout>
</template>
