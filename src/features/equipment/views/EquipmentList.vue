<script setup lang="ts">
import { watch } from "vue";
import { z } from "zod";
import { PlusIcon, TrashIcon } from "@heroicons/vue/24/solid";
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
import { iconFor } from "../icons";
import { equipmentRoutes } from "../routes";
import type { Equipment } from "../types";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
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

const { data, isLoading, error, reload } = usePagedList(
    (q) =>
        apiClient.getEquipment({
            queries: { Name: q.name.trim() || undefined, Page: q.page, PageSize: PAGE_SIZE },
        }),
    query,
);

watch(data, (page) => {
    if (page) void clampPage(page.totalPages);
});

const confirm = useConfirm();
const toasts = useToastsStore();

async function deleteEquipment(equipment: Equipment): Promise<void> {
    const confirmed = await confirm({
        title: "Delete equipment?",
        message: `"${equipment.name}" will be permanently deleted. This cannot be undone.`,
        confirmText: "Delete",
        danger: true,
    });
    if (!confirmed) return;

    const result = await apiCall(() =>
        apiClient.deleteEquipmentEquipmentId(undefined, { params: { equipmentId: equipment.id } }),
    );
    if (!result.ok) {
        toasts.pushError({
            title: "Failed to delete equipment",
            message: apiErrorMessage(result.error),
        });
        return;
    }

    toasts.pushSuccess({ title: "Deleted", message: `Equipment "${equipment.name}" was deleted` });
    await reload();
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
                <template #cell-name="{ row }">
                    <span class="inline-flex max-w-full items-center gap-3 align-middle">
                        <component
                            :is="iconFor(row.icon)"
                            class="text-text/65 border-text/20 bg-text/5 size-6 shrink-0 rounded-md border p-1"
                        />
                        <TextLink
                            v-if="hasPermission(Permission.EquipmentEdit)"
                            :to="{
                                name: equipmentRoutes.edit.name,
                                params: { equipmentId: row.id },
                            }"
                            class="truncate"
                        >
                            {{ row.name }}
                        </TextLink>
                        <span v-else class="text-text truncate font-medium">{{ row.name }}</span>
                    </span>
                </template>

                <template #cell-delete="{ row }">
                    <IconButton type="danger" @click="deleteEquipment(row)">
                        <TrashIcon class="size-4" />
                    </IconButton>
                </template>
            </DataTable>
        </Container>
    </AsideNavbarLayout>
</template>
