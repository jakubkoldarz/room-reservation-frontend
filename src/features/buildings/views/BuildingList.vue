<script setup lang="ts">
import { watch } from "vue";
import { z } from "zod";
import { MapPinIcon, PlusIcon, Square3Stack3DIcon, TrashIcon } from "@heroicons/vue/24/solid";
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
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import LinkButton from "@/features/shared/LinkButton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { buildingRoutes } from "../routes";
import { useBuildingsStore } from "../stores/useBuildingsStore";
import type { Building } from "../types";
import { formatCityLine } from "../utils/formatAddres";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
    { key: "name", label: "Building", align: "left" },
    { key: "location", label: "Address", width: 320, align: "left" },
    { key: "floors", label: "Floors", width: 140, align: "left" },
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
    buildingsStore.fetchBuildings();
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
                <template #cell-name="{ row }">
                    <TextLink
                        v-if="hasPermission(Permission.BuildingView)"
                        :to="{ name: buildingRoutes.view.name, params: { buildingId: row.id } }"
                        class="block truncate"
                    >
                        {{ row.name }}
                    </TextLink>
                    <span v-else class="text-text block truncate font-medium">{{ row.name }}</span>
                    <span v-if="row.identifier" class="text-text-muted block truncate text-xs">
                        {{ row.identifier }}
                    </span>
                </template>

                <template #cell-location="{ row }">
                    <span class="inline-flex max-w-full items-start gap-2 text-left align-middle">
                        <MapPinIcon class="text-text-muted/70 mt-0.5 size-4 shrink-0" />
                        <span class="min-w-0">
                            <span class="block truncate">{{ row.street }}</span>
                            <span class="text-text-muted block truncate text-xs">
                                {{ formatCityLine(row) }}
                            </span>
                        </span>
                    </span>
                </template>

                <template #cell-floors="{ row }">
                    <span class="inline-flex items-center gap-2 align-middle">
                        <Square3Stack3DIcon class="text-text-muted/70 size-4 shrink-0" />
                        {{ row.floorsCount }} {{ row.floorsCount === 1 ? "floor" : "floors" }}
                    </span>
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
