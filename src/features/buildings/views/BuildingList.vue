<script setup lang="ts">
import { watch } from "vue";
import { z } from "zod";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { pageParam, textParam, useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import { defineFilters } from "@/features/filters/types";
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
import { buildingRoutes } from "../routes";
import { useBuildingsStore } from "../stores/useBuildingsStore";
import type { Building } from "../types";
import { formatAddress } from "../utils/formatAddres";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();

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

const filters = defineFilters([{ key: "name", type: "text", placeholder: "Building name" }]);

const { query, setFilter, clampPage } = useListQuery(
    z.object({ page: pageParam, name: textParam }),
);

const { data, isLoading, error, reload } = usePagedList(
    (q) =>
        apiClient.getBuildings({
            queries: { Name: q.name.trim() || undefined, Page: q.page, PageSize: PAGE_SIZE },
        }),
    query,
);

watch(data, (page) => {
    if (page) clampPage(page.totalPages);
});

const confirm = useConfirm();
const toasts = useToastsStore();
const buildingsStore = useBuildingsStore();

async function deleteBuilding(building: Building): Promise<void> {
    const confirmed = await confirm({
        title: "Delete building?",
        message: `"${building.name}" will be permanently deleted. This cannot be undone.`,
        confirmText: "Delete",
        danger: true,
    });
    if (!confirmed) return;

    const result = await apiCall(() =>
        apiClient.deleteBuildingsBuildingId(undefined, { params: { buildingId: building.id } }),
    );
    if (!result.ok) {
        toasts.pushError({
            title: "Failed to delete building",
            message: apiErrorMessage(result.error),
        });
        return;
    }

    toasts.pushSuccess({ title: "Deleted", message: `Building "${building.name}" was deleted` });
    await reload();
    void buildingsStore.fetchBuildings(); // odśwież też listę w panelu bocznym
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
                        v-if="hasPermission(Permission.BuildingAdd)"
                        :to="{ name: buildingRoutes.add.name }"
                        class="w-full rounded! py-1.5! sm:max-w-45"
                    >
                        <PlusIcon />
                        Add Building
                    </LinkButton>
                    <FiltersPanel
                        :filters
                        :values="query"
                        class="w-full shrink-0 @sm:w-auto"
                        @change="setFilter"
                    />
                </div>
                <PagerBlock :current="query.page" :total="data?.totalPages ?? 1" />
            </div>

            <ErrorText v-if="error" :error="apiErrorMessage(error)" class="mt-4" />

            <DataTable
                :columns
                :items="data?.items ?? []"
                row-key="id"
                :is-loading="isLoading"
                :skeleton-rows="PAGE_SIZE"
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
                    <IconButton type="danger" @click="deleteBuilding(row)">
                        <TrashIcon class="size-4" />
                    </IconButton>
                </template>
            </DataTable>
        </Container>
    </AsideNavbarLayout>
</template>
