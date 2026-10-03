<script setup lang="ts">
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import Badge from "@/features/shared/Badge.vue";
import { formatAddress } from "../utils/formatAddres";
import Container from "@/features/shared/Container.vue";
import { onMounted, ref, watch } from "vue";
import LinkButton from "@/features/shared/LinkButton.vue";
import { buildingRoutes } from "../routes";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/solid";
import IconButton from "@/features/shared/IconButton.vue";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { defineFilters, type FilterValues } from "@/features/filters/types";
import Filters from "@/features/filters/components/Filters.vue";
import { watchDebounced } from "@vueuse/core";
import { useBuildingsList } from "../composables/useBuildingsList";
import { usePager } from "@/features/pager/composables/usePager";
import Pager from "@/features/pager/components/Pager.vue";

const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
    { key: "link", width: 65, align: "center", visible: hasPermission(Permission.BuildingView) },
    { key: "identifier", label: "Identifier", width: 150, align: "left" },
    { key: "name", label: "Name" },
    { key: "location", label: "Location", width: 350 },
    { key: "floors", label: "Floors", width: 100, align: "center" },
    { key: "delete", width: 65, align: "center", visible: hasPermission(Permission.BuildingDelete) },
]);

const filters = defineFilters([{ type: "text", key: "Name", placeholder: "Building name" }]);
const values = ref<FilterValues<typeof filters>>({});
const { pager } = usePager(2);

const { fetchBuildings, isLoading, pagedBuildings } = useBuildingsList();
onMounted(() => fetchBuildings(values.value, pager.value));

function deleteBuilding(buildingId: string) {
    // TODO: ADD MODAL CONFIRMATION
    console.log("Delete building with ID:", buildingId);
}

async function refetchBuildings() {
    await fetchBuildings(values.value, pager.value);
}
watchDebounced(
    values,
    () => {
        pager.value.page = 1;
        refetchBuildings();
    },
    { debounce: 300, deep: true },
);

watch(pager, () => {
    refetchBuildings();
});
</script>

<template>
    <AsideNavbarLayout>
        <Container class="px-0! py-0! @container">
            <div
                class="p-4 flex flex-col @md:flex-row border-b border-border items-center gap-2 justify-between flex-wrap"
            >
                <div class="flex flex-col @sm:flex-row items-center gap-2 shrink-0">
                    <LinkButton
                        v-if="hasPermission(Permission.BuildingAdd)"
                        :to="{ name: buildingRoutes.add.name }"
                        class="w-full sm:max-w-45 py-1.5! rounded!"
                    >
                        <PlusIcon />
                        Add Building
                    </LinkButton>
                    <Filters :filters v-model="values" class="w-full @sm:w-auto shrink-0" />
                </div>
                <Pager :current-page="pagedBuildings.page" :total-pages="16" />
            </div>

            <DataTable
                v-if="pagedBuildings.value"
                :columns
                :items="pagedBuildings.value"
                row-key="id"
                :is-loading="isLoading"
                :pager="pager"
            >
                <template #cell-link="{ row }">
                    <LinkButton
                        class="py-0! px-4! flex! items-center justify-center"
                        :to="{ name: buildingRoutes.view.name, params: { buildingId: row.id } }"
                    >
                        <ArrowRightIcon />
                    </LinkButton>
                </template>

                <template #cell-identifier="{ row }">
                    <Badge v-if="row.identifier">
                        {{ row.identifier }}
                    </Badge>
                </template>

                <template #cell-name="{ row }">
                    {{ row.name }}
                </template>

                <template #cell-location="{ row }">
                    {{ formatAddress(row) }}
                </template>

                <template #cell-floors="{ row }">
                    {{ row.floorsCount }}
                </template>

                <template #cell-delete="{ row }">
                    <IconButton type="danger">
                        <TrashIcon class="size-4" @click="() => deleteBuilding(row.id)" />
                    </IconButton>
                </template>
            </DataTable>
        </Container>
    </AsideNavbarLayout>
</template>
