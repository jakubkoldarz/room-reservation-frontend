<script setup lang="ts">
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "../auth/constants/permissions";
import LinkButton from "./LinkButton.vue";
import { dashboardRoutes } from "../dashboard/routes";
import {
    CalendarDaysIcon,
    ClipboardDocumentListIcon,
    HomeIcon,
    RectangleGroupIcon,
    ShieldCheckIcon,
    StarIcon,
    UsersIcon,
} from "@heroicons/vue/24/solid";
import { useBuildingsStore } from "../buildings/stores/useBuildingsStore.ts";
import AsideList from "./AsideList.vue";
import { useRoute } from "vue-router";
import { computed, onMounted, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { buildingRoutes } from "../buildings/routes.ts";
import { equipmentRoutes } from "../equipment/routes.ts";
import { eventRoutes } from "../events/routes.ts";
import { profileRoutes } from "../profile/routes.ts";
import { reservationRoutes } from "../reservations/routes.ts";
import { roleRoutes } from "../roles/routes.ts";
import { roomRoutes } from "../rooms/routes.ts";
import { userRoutes } from "../users/routes.ts";
import { useRoomsStore } from "../rooms/stores/useRoomsStore.ts";
import { useRoomDestination } from "../rooms/composables/useRoomDestination.ts";

const { hasPermission } = usePermissions();
const buildingsStore = useBuildingsStore();
const roomsStore = useRoomsStore();
const { roomLink } = useRoomDestination();
const route = useRoute();

const myReservationsLink = { name: profileRoutes.view.name, query: { tab: "reservations" } };
const isMyReservationsActive = computed(
    () => route.name === profileRoutes.view.name && route.query.tab === "reservations",
);

const buildingItems = computed(() => {
    const canView = hasPermission(Permission.BuildingView);
    return buildingsStore.buildings?.map((b) => ({
        name: b.name,
        id: b.id,
        to: canView ? { name: buildingRoutes.view.name, params: { buildingId: b.id } } : undefined,
    }));
});

const roomItems = computed(() => {
    return roomsStore.rooms.map(({ roomInfo }) => ({
        name: roomInfo.identifier,
        id: roomInfo.id,
        to: roomLink(roomInfo.id) ?? {
            name: roomRoutes.list.name,
            query: { identifier: roomInfo.identifier },
        },
    }));
});

watch(
    () => route.fullPath,
    () => emit("forceClose"),
);

const { isMobileAsideOpen } = defineProps<{
    isMobileAsideOpen?: boolean;
}>();

const emit = defineEmits<{
    forceClose: [];
}>();

onMounted(async () => {
    if (hasPermission(Permission.BuildingList)) await buildingsStore.ensureLoaded();
});

onMounted(async () => {
    if (hasPermission(Permission.RoomList)) await roomsStore.ensureLoaded();
});

async function refetchBuildings() {
    await buildingsStore.fetchBuildings();
}

async function refetchRooms() {
    await roomsStore.fetchRooms();
}

watchDebounced(
    () => buildingsStore.queryParam,
    async () => {
        if (hasPermission(Permission.BuildingList)) {
            await refetchBuildings();
        }
    },
    { debounce: 300 },
);

watchDebounced(
    () => roomsStore.queryParam,
    async () => {
        if (hasPermission(Permission.RoomList)) {
            await refetchRooms();
        }
    },
    { debounce: 300 },
);
</script>

<template>
    <aside
        class="border-text-muted/20 md:bg-surface shrink-0 md:w-72 md:scrollbar-thin md:overflow-x-hidden md:overflow-y-auto md:border-r"
    >
        <div
            @click="emit('forceClose')"
            :class="[
                isMobileAsideOpen ? 'fixed opacity-100' : 'hidden opacity-0',
                'inset-0 z-100 bg-black/30 backdrop-blur-sm md:hidden',
                'transition-opacity transition-discrete duration-300 ease-out starting:opacity-0',
            ]"
        ></div>

        <div
            :class="[
                isMobileAsideOpen ? 'fixed translate-x-0' : 'hidden -translate-x-full',
                'top-12 bottom-0 left-0 overflow-y-auto',
                'md:static md:block md:w-auto md:translate-x-0 md:overflow-visible md:border-r-0',
                'border-text-muted/20 bg-surface z-101 w-full border-r p-4 sm:w-72',
                'transition-transform transition-discrete duration-150 ease-out sm:duration-300 starting:-translate-x-full md:starting:translate-0',
            ]"
        >
            <div class="flex flex-col gap-2">
                <LinkButton :to="dashboardRoutes.dashboard">
                    <HomeIcon />
                    Dashboard
                </LinkButton>
                <LinkButton :to="myReservationsLink" :active="isMyReservationsActive">
                    <ClipboardDocumentListIcon />
                    My reservations
                </LinkButton>
                <LinkButton
                    v-if="hasPermission(Permission.ReservationList)"
                    :to="reservationRoutes.list"
                >
                    <CalendarDaysIcon />
                    Reservations
                </LinkButton>
                <LinkButton
                    v-if="hasPermission(Permission.EquipmentList)"
                    :to="equipmentRoutes.list"
                >
                    <RectangleGroupIcon />
                    Equipment
                </LinkButton>
                <LinkButton v-if="hasPermission(Permission.EventList)" :to="eventRoutes.list">
                    <StarIcon />
                    Events
                </LinkButton>
                <LinkButton v-if="hasPermission(Permission.UserList)" :to="userRoutes.list">
                    <UsersIcon />
                    Users
                </LinkButton>
                <LinkButton v-if="hasPermission(Permission.RoleList)" :to="roleRoutes.list">
                    <ShieldCheckIcon />
                    Roles
                </LinkButton>
                <AsideList
                    v-model="buildingsStore.queryParam"
                    v-if="hasPermission(Permission.BuildingList)"
                    class="mt-4"
                    title="Buildings"
                    :to="buildingRoutes.list"
                    :items="buildingItems"
                    :display-count="4"
                    :is-loading="buildingsStore.isLoading"
                    :total-count="buildingsStore.totalCount"
                    searchbar-placeholder="Search buildings..."
                    @searchbar-focus="refetchBuildings"
                />
                <AsideList
                    v-model="roomsStore.queryParam"
                    v-if="hasPermission(Permission.RoomList)"
                    class="mt-4"
                    title="Rooms"
                    :to="roomRoutes.list"
                    :items="roomItems"
                    :display-count="4"
                    :is-loading="roomsStore.isLoading"
                    :total-count="roomsStore.totalCount"
                    searchbar-placeholder="Search rooms..."
                    @searchbar-focus="refetchRooms"
                />
            </div>
        </div>
    </aside>
</template>
