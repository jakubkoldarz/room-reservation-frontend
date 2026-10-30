<script setup lang="ts">
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "../auth/constants/permissions";
import LinkButton from "./LinkButton.vue";
import { dashboardRoutes } from "../dashboard/routes";
import { HomeIcon, RectangleGroupIcon, StarIcon } from "@heroicons/vue/24/solid";
import { useBuildingsStore } from "../buildings/stores/useBuildingsStore.ts";
import AsideList from "./AsideList.vue";
import { useRoute } from "vue-router";
import { computed, onMounted, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { buildingRoutes } from "../buildings/routes.ts";
import { equipmentRoutes } from "../equipment/routes.ts";

const { hasPermission } = usePermissions();
const buildingsStore = useBuildingsStore();
const route = useRoute();

const buildingItems = computed(() => {
    return buildingsStore.buildings?.map((b) => ({
        name: b.name,
        id: b.id,
        to: { name: buildingRoutes.view.name, params: { buildingId: b.id } },
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

onMounted(() => {
    if (hasPermission(Permission.BuildingList)) {
        buildingsStore.ensureLoaded();
    }
});

async function refetchBuildings() {
    await buildingsStore.fetchBuildings();
}

watchDebounced(
    () => buildingsStore.queryParam,
    () => {
        if (hasPermission(Permission.BuildingList)) {
            refetchBuildings();
        }
    },
    { debounce: 300 },
);
</script>

<template>
    <aside class="shrink-0 md:block">
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
                'md:static md:block md:translate-x-0',
                'border-text-muted/20 bg-surface z-101 min-h-full w-full border-r p-4 sm:w-72',
                'transition-transform transition-discrete duration-150 ease-out sm:duration-300 starting:-translate-x-full md:starting:translate-0',
            ]"
        >
            <div class="flex flex-col gap-2">
                <LinkButton :to="dashboardRoutes.dashboard">
                    <HomeIcon />
                    Dashboard
                </LinkButton>
                <LinkButton :to="equipmentRoutes.list">
                    <RectangleGroupIcon />
                    Equipment
                </LinkButton>
                <LinkButton :to="equipmentRoutes.list">
                    <StarIcon />
                    Events
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
                    class="mt-4"
                    title="Rooms"
                    :is-loading="true"
                    :total-count="14"
                    v-if="hasPermission(Permission.RoomList)"
                />
            </div>
        </div>
    </aside>
</template>
