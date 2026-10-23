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
import { useApiCall } from "@/composables/useApiCall";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import Modal from "@/features/modal/components/Modal.vue";
import { useList } from "@/composables/useList";
import type { Building } from "../types";
import { useFilters } from "@/features/filters/composables/useFilters";
import apiClient from "@/api/client";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import { usePager } from "@/features/pager/composables/usePager";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";

const { hasPermission } = usePermissions();
const { call } = useApiCall();

const columns = useVisibleColumns(() => [
    { key: "link", width: 65, align: "center", visible: hasPermission(Permission.BuildingView) },
    { key: "identifier", label: "Identifier", width: 150, align: "left" },
    { key: "name", label: "Name" },
    { key: "location", label: "Location", width: 350 },
    { key: "floors", label: "Floors", width: 100, align: "center" },
    {
        key: "delete",
        width: 65,
        align: "center",
        visible: hasPermission(Permission.BuildingDelete),
    },
]);

const { filters, values } = useFilters([
    { key: "Name", type: "text", placeholder: "Building name" },
]);
const pager = usePager(2);

const {
    fetch: fetchBuildings,
    isLoading,
    page: pagedBuildings,
} = useList<Building>(() =>
    apiClient.getBuildings({
        queries: { ...values.value, Page: pager.value.page, PageSize: pager.value.pageSize },
    }),
);
onMounted(() => fetchBuildings());
watch(() => pager.value.page, fetchBuildings);
watch(values, fetchBuildings);

async function deleteBuilding(buildingId: string) {
    isModalOpen.value = true;

    // const response = await call(() =>
    //     apiClient.deleteBuildingsBuildingId(undefined, { params: { buildingId } }),
    // );
    // const toastsStore = useToastsStore();

    // // TODO: Dodać modal
    // if (response.success) {
    //     fetchBuildings();
    //     toastsStore.pushSuccess({ title: "Success", message: "Building deleted successfully" });
    // } else {
    //     toastsStore.pushApiError({ title: "Failed to delete building", error: response.error });
    // }
}
const isModalOpen = ref(false);
</script>

<template>
    <AsideNavbarLayout>
        <Modal :is-open="isModalOpen" @close="isModalOpen = false" />
        <Container class="@container px-0! py-0!">
            <div
                class="border-border flex flex-col flex-wrap items-center justify-between gap-2 border-b p-4 @md:flex-row"
            >
                <div class="flex shrink-0 flex-col items-center gap-2 @sm:flex-row">
                    <LinkButton
                        v-if="hasPermission(Permission.BuildingAdd)"
                        :to="{ name: buildingRoutes.add.name }"
                        class="w-full rounded! py-1.5! sm:max-w-45"
                    >
                        <PlusIcon />
                        Add Building
                    </LinkButton>
                    <FiltersPanel :filters v-model="values" class="w-full shrink-0 @sm:w-auto" />
                </div>
                <PagerBlock
                    :current-page="pagedBuildings?.page ?? 1"
                    :total-pages="pagedBuildings?.totalPages ?? 1"
                />
            </div>

            <DataTable
                v-if="pagedBuildings?.items"
                :columns
                :items="pagedBuildings?.items"
                row-key="id"
                :is-loading="isLoading"
                :pager="pager"
            >
                <template #cell-link="{ row }">
                    <LinkButton
                        class="flex! items-center justify-center px-4! py-0!"
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
