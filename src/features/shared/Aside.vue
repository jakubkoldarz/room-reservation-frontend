<script setup lang="ts">
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "../auth/constants/permissions";
import LinkButton from "./LinkButton.vue";
import { dashboardRoutes } from "../dashboard/routes";
import { BuildingOffice2Icon, HomeIcon } from "@heroicons/vue/24/solid";
import { buildingRoutes } from "../buildings/routes.ts";
import { useBuildingsStore } from "../buildings/stores/useBuildingsStore.ts";
import AsideList from "./AsideList.vue";

const { hasPermission } = usePermissions();
const buildingsStore = useBuildingsStore();

if (hasPermission(Permission.BuildingList)) {
    buildingsStore.fetchBuildings();
}
</script>

<template>
    <aside class="md:w-64 hidden md:block shrink-0 p-4 border-r border-text-muted/20 bg-surface min-h-full">
        <div class="flex flex-col gap-2">
            <LinkButton :to="dashboardRoutes.dashboard">
                <HomeIcon />
                Dashboard
            </LinkButton>
            <LinkButton :to="buildingRoutes.list">
                <BuildingOffice2Icon />
                Buildings
            </LinkButton>
            <AsideList
                class="mt-2"
                title="Buildings"
                :items="buildingsStore.buildings?.map((b) => ({ name: b.name, id: b.id }))"
                :is-loading="buildingsStore.isLoading"
                :total-count="buildingsStore.buildings?.length"
                v-if="hasPermission(Permission.BuildingList)"
            />
            <AsideList
                class="mt-2"
                title="Rooms"
                :is-loading="true"
                :total-count="14"
                v-if="hasPermission(Permission.RoomList)"
            />
        </div>
    </aside>
</template>
