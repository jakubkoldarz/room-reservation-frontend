<script setup lang="ts">
import { ref, watch } from "vue";
import { z } from "zod";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiErrorMessage } from "@/api/errors";
import { pageParam, textParam, useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import { defineFilters } from "@/features/filters/types";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import Modal from "@/features/modal/components/Modal.vue";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import LinkButton from "@/features/shared/LinkButton.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import { iconFor } from "../icons";
import { equipmentRoutes } from "../routes";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
    { key: "link", width: 65, align: "center", visible: hasPermission(Permission.EquipmentView) },
    { key: "icon", label: "Icon", width: 75, align: "center" },
    { key: "name", label: "Equipment", align: "left" },
    {
        key: "delete",
        width: 65,
        align: "center",
        visible: hasPermission(Permission.EquipmentDelete),
    },
]);

const filters = defineFilters([{ key: "name", type: "text", placeholder: "Equipment" }]);

const { query, setFilter, clampPage } = useListQuery(
    z.object({ page: pageParam, name: textParam }),
);

const { data, isLoading, error } = usePagedList(
    (q) =>
        apiClient.getEquipment({
            queries: { Name: q.name.trim() || undefined, Page: q.page, PageSize: PAGE_SIZE },
        }),
    query,
);

watch(data, (page) => {
    if (page) void clampPage(page.totalPages);
});

// TODO (moduł 5): useConfirm → apiCall(delete) → toast → reload() z usePagedList
const pendingDeleteId = ref<string | null>(null);
const isModalOpen = ref(false);

function deleteEquipment(equipmentId: string): void {
    pendingDeleteId.value = equipmentId;
    isModalOpen.value = true;
}
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
                        v-if="hasPermission(Permission.EquipmentAdd)"
                        :to="{ name: equipmentRoutes.add.name }"
                        class="w-full rounded! py-1.5! sm:max-w-45"
                    >
                        <PlusIcon />
                        Add Equipment
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
                        :to="{ name: equipmentRoutes.edit.name, params: { equipmentId: row.id } }"
                    >
                        <ArrowRightIcon />
                    </LinkButton>
                </template>

                <template #cell-icon="{ row }">
                    <div class="flex items-center justify-center">
                        <component
                            :is="iconFor(row.icon)"
                            class="text-text/65 border-text/20 bg-text/5 size-5 rounded-md border p-0.5"
                        />
                    </div>
                </template>

                <template #cell-name="{ row }">
                    {{ row.name }}
                </template>

                <template #cell-delete="{ row }">
                    <IconButton type="danger" @click="deleteEquipment(row.id)">
                        <TrashIcon class="size-4" />
                    </IconButton>
                </template>
            </DataTable>
        </Container>
    </AsideNavbarLayout>
</template>
