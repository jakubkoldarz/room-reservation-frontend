<script setup lang="ts">
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "../auth/constants/permissions";
import LinkButton from "./LinkButton.vue";
import { dashboardRoutes } from "../dashboard/routes";
import { HomeIcon } from "@heroicons/vue/24/solid";
import { buildingRoutes } from "../buildings/routes.ts";
import { useBuildingsStore } from "../buildings/stores/useBuildingsStore.ts";
import AsideList from "./AsideList.vue";
import { useRoute } from "vue-router";
import { watch } from "vue";

const { hasPermission } = usePermissions();
const buildingsStore = useBuildingsStore();
const route = useRoute();

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

if (hasPermission(Permission.BuildingList)) {
    buildingsStore.fetchBuildings();
}

async function refetchBuildings() {
    await buildingsStore.fetchBuildings(true);
}
</script>

<template>
    <aside class="md:block shrink-0">
        <!-- backdrop -->
        <div
            @click="emit('forceClose')"
            :class="[
                isMobileAsideOpen ? 'fixed opacity-100' : 'hidden opacity-0',
                'md:hidden inset-0 z-100 bg-black/30 backdrop-blur-sm',
                'transition-discrete transition-opacity duration-300 ease-out starting:opacity-0',
            ]"
        ></div>

        <!-- aside panel -->
        <div
            :class="[
                isMobileAsideOpen ? 'fixed translate-x-0' : 'hidden -translate-x-full',
                'md:block md:static md:translate-x-0',
                'z-101 w-full sm:w-72 p-4 border-r border-text-muted/20 bg-surface min-h-full',
                'transition-discrete transition-transform duration-150 sm:duration-300 ease-out starting:-translate-x-full md:starting:translate-0',
            ]"
        >
            <div class="flex flex-col gap-2">
                <LinkButton :to="dashboardRoutes.dashboard">
                    <HomeIcon />
                    Dashboard
                </LinkButton>
                <AsideList
                    v-if="hasPermission(Permission.BuildingList)"
                    class="mt-4"
                    title="Buildings"
                    :items="
                        buildingsStore.buildings?.map((b) => ({
                            name: b.name,
                            id: b.id,
                            to: { name: buildingRoutes.view.name, params: { buildingId: b.id } },
                        }))
                    "
                    :display-count="4"
                    :is-loading="buildingsStore.isLoading"
                    :total-count="buildingsStore.buildings?.length"
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
