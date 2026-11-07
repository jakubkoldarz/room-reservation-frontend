<script setup lang="ts">
import { computed, watch } from "vue";
import {
    BuildingOfficeIcon,
    CalendarDaysIcon,
    ClockIcon,
    RectangleStackIcon,
    TagIcon,
} from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiErrorMessage } from "@/api/errors";
import { useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useAllBuildings } from "@/features/buildings/composables/useAllBuildings";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import MoreFiltersButton from "@/features/filters/components/MoreFiltersButton.vue";
import MoreFiltersPanel from "@/features/filters/components/MoreFiltersPanel.vue";
import { useMoreFilters } from "@/features/filters/composables/useMoreFilters";
import { defineFilters, type Filter } from "@/features/filters/types";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import { useAllRooms } from "@/features/rooms/composables/useAllRooms";
import { useRoomDestination } from "@/features/rooms/composables/useRoomDestination";
import { BLOCK_CLASSES } from "@/features/rooms/utils/calendarStyles";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import TextLink from "@/features/shared/TextLink.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import type { Column } from "@/features/table/types";
import { toIsoDate } from "@/utils/isoDate";
import { EventListQuerySchema } from "../schemas";
import type { EventPeriod } from "../types";
import { eventDayCount, eventHours, eventPeriod, formatEventDates } from "../utils/eventFormat";
import { toEventQueries } from "../utils/eventQueries";

const PAGE_SIZE = 25;
const VISIBLE_ROOMS = 3;

const columns: Column[] = [
    { key: "name", label: "Event", align: "left" },
    { key: "dates", label: "Dates", width: 250, align: "left" },
    { key: "hours", label: "Opening hours", width: 150, align: "left" },
    { key: "rooms", label: "Rooms", width: 240, align: "left" },
];

const PERIOD_LABELS: Record<EventPeriod, string> = {
    upcoming: "Upcoming",
    ongoing: "Ongoing",
    past: "Past",
};

const { hasPermission } = usePermissions();
const { buildings } = useAllBuildings();
const { rooms } = useAllRooms();
const { roomLink } = useRoomDestination();

const { query, setFilter, setFilters, clampPage } = useListQuery(EventListQuerySchema);

const roomOptions = computed(() =>
    rooms.value
        .filter((room) => !query.value.building || room.buildingInfo.id === query.value.building)
        .map((room) => ({
            value: room.roomInfo.id,
            label: `${room.roomInfo.identifier} · ${room.buildingInfo.name}`,
        })),
);

const filters = computed(() =>
    defineFilters([
        { key: "name", type: "text", placeholder: "Event name" },
        {
            key: "when",
            type: "select",
            placeholder: "Period",
            icon: ClockIcon,
            values: [
                { value: "upcoming", label: "Ongoing and upcoming" },
                { value: "past", label: "Past" },
                { value: "all", label: "All" },
            ],
        } satisfies Filter<"when">,
        { key: "date", type: "date", placeholder: "Active on", icon: CalendarDaysIcon },
    ]),
);

const moreFilters = computed(() =>
    defineFilters([
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
        ...(hasPermission(Permission.RoomList)
            ? [
                  {
                      key: "room",
                      type: "select",
                      placeholder: "Room",
                      icon: RectangleStackIcon,
                      values: roomOptions.value,
                  } satisfies Filter<"room">,
              ]
            : []),
        {
            key: "type",
            type: "select",
            placeholder: "Type",
            icon: TagIcon,
            values: [
                { value: "closed", label: "Room closed" },
                { value: "hours", label: "Special hours" },
            ],
        } satisfies Filter<"type">,
    ]),
);

const moreFiltersState = useMoreFilters(moreFilters, query, setFilters);
const { activeCount: activeMoreFilters, isOpen: showMoreFilters } = moreFiltersState;

const { data, isLoading, error } = usePagedList(
    (q) => apiClient.getEvents({ queries: toEventQueries(q, PAGE_SIZE, new Date()) }),
    query,
);

watch(data, (page) => {
    if (page) void clampPage(page.totalPages);
});

const todayIso = toIsoDate(new Date());

const periodNotice = computed(() => {
    if (query.value.date) return null;
    if (query.value.when === "past") return "Showing events that have already ended.";
    if (query.value.when === "all") return null;
    return "Showing ongoing and upcoming events.";
});
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
                    <FiltersPanel
                        :filters
                        :values="query"
                        class="w-full shrink-0 @sm:w-auto"
                        @change="setFilter"
                    />
                    <MoreFiltersButton
                        v-model="showMoreFilters"
                        controls="event-more-filters"
                        :active-count="activeMoreFilters"
                    />
                </div>
                <PagerBlock :current="query.page" :total="data?.totalPages ?? 1" />
            </div>

            <MoreFiltersPanel
                v-show="showMoreFilters"
                id="event-more-filters"
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
                row-key="id"
                :is-loading="isLoading"
                :skeleton-rows="PAGE_SIZE"
            >
                <template #cell-name="{ row }">
                    <span class="text-text block truncate font-medium">{{ row.name }}</span>
                    <span
                        class="block text-xs"
                        :class="
                            eventPeriod(row, todayIso) === 'ongoing'
                                ? 'text-primary font-medium'
                                : 'text-text-muted'
                        "
                    >
                        {{ PERIOD_LABELS[eventPeriod(row, todayIso)] }}
                    </span>
                </template>

                <template #cell-dates="{ row }">
                    <span class="text-text block truncate">{{ formatEventDates(row) }}</span>
                    <span class="text-text-muted block text-xs">
                        {{ eventDayCount(row) === 1 ? "1 day" : `${eventDayCount(row)} days` }}
                    </span>
                </template>

                <template #cell-hours="{ row }">
                    <span
                        class="inline-flex rounded border-l-4 px-2 py-0.5 text-xs font-medium whitespace-nowrap"
                        :class="row.isClosed ? BLOCK_CLASSES.closed : BLOCK_CLASSES.event"
                    >
                        {{ row.isClosed ? "Room closed" : eventHours(row) }}
                    </span>
                </template>

                <template #cell-rooms="{ row }">
                    <span class="inline-flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <template v-for="room in row.rooms.slice(0, VISIBLE_ROOMS)" :key="room.id">
                            <TextLink v-if="roomLink(room.id)" :to="roomLink(room.id)!">
                                {{ room.identifier }}
                            </TextLink>
                            <span v-else class="text-text font-medium">{{ room.identifier }}</span>
                        </template>
                        <BaseTooltip
                            v-if="row.rooms.length > VISIBLE_ROOMS"
                            :text="
                                row.rooms
                                    .slice(VISIBLE_ROOMS)
                                    .map((room) => room.identifier)
                                    .join(', ')
                            "
                        >
                            <span class="text-text-muted cursor-help text-xs">
                                +{{ row.rooms.length - VISIBLE_ROOMS }} more
                            </span>
                        </BaseTooltip>
                    </span>
                </template>
            </DataTable>
        </Container>
    </AsideNavbarLayout>
</template>
