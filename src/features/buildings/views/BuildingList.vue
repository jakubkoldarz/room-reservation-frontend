<script setup lang="ts">
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import Badge from "@/features/shared/Badge.vue";
import { formatAddress } from "../utils/formatAddres";
import Container from "@/features/shared/Container.vue";
import type { BuildingsPage } from "../types";
import { onMounted, ref } from "vue";
import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import LinkButton from "@/features/shared/LinkButton.vue";
import { buildingRoutes } from "../routes";
import { ArrowRightIcon, TrashIcon } from "@heroicons/vue/24/solid";
import IconButton from "@/features/shared/IconButton.vue";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import type { Filter } from "@/features/filters/types";
import Filters from "@/features/filters/components/Filters.vue";

const { call, isLoading } = useApiCall();
const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
    { key: "link", width: 65, align: "center", visible: hasPermission(Permission.BuildingView) },
    { key: "identifier", label: "Identifier", width: 150, align: "left" },
    { key: "name", label: "Name" },
    { key: "location", label: "Location", width: 350 },
    { key: "floors", label: "Floors", width: 100, align: "center" },
    { key: "delete", width: 65, align: "center", visible: hasPermission(Permission.BuildingDelete) },
]);

console.log("Columns:", columns);

const pagedBuildings = ref<BuildingsPage>({
    value: [],
});

onMounted(async () => {
    const response = await call(() => apiClient.getBuildings({ queries: { Page: 1, PageSize: 25 } }));
    if (response.success) {
        pagedBuildings.value = response.data;
    }
});

function deleteBuilding(buildingId: string) {
    // TODO: ADD MODAL CONFIRMATION
    console.log("Delete building with ID:", buildingId);
}

const filters = [{ type: "text", key: "name", placeholder: "Building name" }] as Filter[];
</script>

<template>
    <AsideNavbarLayout>
        <Container class="px-0!">
            <div class="px-4 pb-6 border-b border-border">
                <Filters :filters />
            </div>
            <DataTable
                v-if="pagedBuildings.value"
                :columns
                :items="pagedBuildings.value"
                row-key="id"
                :is-loading="isLoading"
                :pager="{
                    page: pagedBuildings.page ?? 1,
                    pageSize: pagedBuildings.pageSize ?? 25,
                    totalCount: pagedBuildings.totalCount ?? 0,
                }"
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
