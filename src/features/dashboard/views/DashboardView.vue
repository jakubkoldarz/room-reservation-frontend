<script setup lang="ts">
import { useIntervalFn, useNow } from "@vueuse/core";
import { computed, useTemplateRef } from "vue";
import apiClient from "@/api/client";
import { apiErrorMessage } from "@/api/errors";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { buildingRoutes } from "@/features/buildings/routes";
import { roomRoutes } from "@/features/rooms/routes";
import TextLink from "@/features/shared/TextLink.vue";
import { toIsoDate } from "@/utils/isoDate";
import DashboardCount from "../components/DashboardCount.vue";
import PendingApprovals from "../components/PendingApprovals.vue";
import QuickReservationForm from "../components/QuickReservationForm.vue";
import TwoFactorReminder from "../components/TwoFactorReminder.vue";
import UpcomingEvents from "../components/UpcomingEvents.vue";
import UpcomingReservations from "../components/UpcomingReservations.vue";
import { useTotalCount } from "../composables/useTotalCount";
import { upcomingReservations } from "../utils/upcoming";

const FETCHED_RESERVATIONS = 20;
const VISIBLE_RESERVATIONS = 5;

const { hasPermission } = usePermissions();
const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });
const todayIso = computed(() => toIsoDate(now.value));

const canSeeRooms = hasPermission(Permission.RoomList);
const canSeeBuildings = hasPermission(Permission.BuildingList);
const canSeeEvents = hasPermission(Permission.EventList);
const canReserve = hasPermission(Permission.ReservationCreate) && canSeeRooms;
const canReview =
    hasPermission(Permission.ReservationList) &&
    (hasPermission(Permission.ReservationApprove) || hasPermission(Permission.ReservationReject));
const hasSideColumn = canSeeRooms || canSeeBuildings || canSeeEvents;

const {
    data: myReservations,
    isLoading: isLoadingMyReservations,
    error: myReservationsError,
    reload: reloadMyReservations,
} = usePagedList(
    (queries) => apiClient.getReservationsmine({ queries }),
    () => ({
        DateFrom: todayIso.value,
        SortBy: "date",
        SortDirection: "asc",
        PageSize: FETCHED_RESERVATIONS,
    }),
);

const upcoming = computed(() =>
    upcomingReservations(myReservations.value?.items ?? [], now.value, VISIBLE_RESERVATIONS),
);

const { count: roomCount, isLoading: isLoadingRoomCount } = useTotalCount(canSeeRooms, () =>
    apiClient.getRooms({ queries: { PageSize: 1 } }),
);
const { count: buildingCount, isLoading: isLoadingBuildingCount } = useTotalCount(
    canSeeBuildings,
    () => apiClient.getBuildings({ queries: { PageSize: 1 } }),
);

const approvals = useTemplateRef("approvals");

function onReservationCreated(): void {
    void reloadMyReservations();
    void approvals.value?.reload();
}
</script>

<template>
    <div class="@container flex flex-col gap-4">
        <TwoFactorReminder />

        <QuickReservationForm v-if="canReserve" :now @created="onReservationCreated" />

        <div class="flex flex-col gap-4 @4xl:flex-row @4xl:items-start">
            <div class="flex min-w-0 flex-1 flex-col gap-4">
                <UpcomingReservations
                    :items="upcoming"
                    :is-loading="isLoadingMyReservations"
                    :error="myReservationsError ? apiErrorMessage(myReservationsError) : null"
                    :now
                />
                <PendingApprovals
                    v-if="canReview"
                    ref="approvals"
                    :now
                    :class="{ '-order-1': !canReserve }"
                />
            </div>

            <div v-if="hasSideColumn" class="flex flex-col gap-4 @4xl:w-80 @4xl:shrink-0">
                <DashboardCount
                    v-if="canSeeRooms"
                    label="Rooms"
                    :count="roomCount"
                    :is-loading="isLoadingRoomCount"
                >
                    <TextLink :to="{ name: roomRoutes.list.name }">All rooms</TextLink>
                    <TextLink
                        v-if="hasPermission(Permission.RoomAdd)"
                        :to="{ name: roomRoutes.add.name }"
                    >
                        Add room
                    </TextLink>
                </DashboardCount>
                <DashboardCount
                    v-if="canSeeBuildings"
                    label="Buildings"
                    :count="buildingCount"
                    :is-loading="isLoadingBuildingCount"
                >
                    <TextLink :to="{ name: buildingRoutes.list.name }">All buildings</TextLink>
                    <TextLink
                        v-if="hasPermission(Permission.BuildingAdd)"
                        :to="{ name: buildingRoutes.add.name }"
                    >
                        Add building
                    </TextLink>
                </DashboardCount>
                <UpcomingEvents v-if="canSeeEvents" :now />
            </div>
        </div>
    </div>
</template>
