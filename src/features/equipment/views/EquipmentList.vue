<script setup lang="ts">
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import Container from "@/features/shared/Container.vue";
import { onMounted, ref, watch } from "vue";
import LinkButton from "@/features/shared/LinkButton.vue";
import { ArrowRightIcon, PlusIcon, TrashIcon } from "@heroicons/vue/24/solid";
import * as SolidIcons from "@heroicons/vue/24/solid";
import IconButton from "@/features/shared/IconButton.vue";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { defineFilters, type FilterValues } from "@/features/filters/types";
import Filters from "@/features/filters/components/Filters.vue";
import { watchDebounced } from "@vueuse/core";
import { usePager } from "@/features/pager/composables/usePager";
import Pager from "@/features/pager/components/Pager.vue";
import apiClient from "@/api/client";
import { useApiCall } from "@/composables/useApiCall";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import Modal from "@/features/modal/components/Modal.vue";
import { useEquipmentList } from "../composables/useEquipmentList";
import { equipmentRoutes } from "../routes";

const { hasPermission } = usePermissions();
const { call } = useApiCall();

const columns = useVisibleColumns(() => [
    { key: "link", width: 65, align: "center", visible: hasPermission(Permission.EquipmentView) },
    { key: "icon", label: "Icon", width: 75, align: "center" },
    { key: "name", label: "Equipment", align: "left" },
    { key: "delete", width: 65, align: "center", visible: hasPermission(Permission.EquipmentDelete) },
]);

const filters = defineFilters([{ type: "text", key: "Name", placeholder: "Equipment" }]);
const values = ref<FilterValues<typeof filters>>({});
const { pager } = usePager(25);

const { fetchEquipment, isLoading, pagedEquipment } = useEquipmentList();
onMounted(() => fetchEquipment(values.value, pager.value));

async function deleteEquipment(equipmentId: string) {
    isModalOpen.value = true;
    return;

    // const response = await call(() => apiClient.deleteBuildingsBuildingId(undefined, { params: { buildingId } }));
    // const toastsStore = useToastsStore();

    // // TODO: Dodać modal
    // if (response.success) {
    //     refetchBuildings();
    //     toastsStore.pushSuccess({ title: "Success", message: "Building deleted successfully" });
    // } else {
    //     toastsStore.pushApiError({ title: "Failed to delete building", error: response.error });
    // }
}

async function refetchEquipment() {
    await fetchEquipment(values.value, pager.value);
}
watchDebounced(
    values,
    () => {
        pager.value.page = 1;
        refetchEquipment();
    },
    { debounce: 300, deep: true },
);

watch(pager, () => {
    refetchEquipment();
});

const isModalOpen = ref(false);
</script>

<template>
    <AsideNavbarLayout>
        <Modal :is-open="isModalOpen" @close="isModalOpen = false" />
        <Container class="px-0! py-0! @container">
            <div
                class="p-4 flex flex-col @md:flex-row border-b border-border items-center gap-2 justify-between flex-wrap"
            >
                <div class="flex flex-col @sm:flex-row items-center gap-2 shrink-0">
                    <LinkButton
                        v-if="hasPermission(Permission.EquipmentAdd)"
                        :to="{ name: equipmentRoutes.add.name }"
                        class="w-full sm:max-w-45 py-1.5! rounded!"
                    >
                        <PlusIcon />
                        Add Equipment
                    </LinkButton>
                    <Filters :filters v-model="values" class="w-full @sm:w-auto shrink-0" />
                </div>
                <Pager :current-page="pagedEquipment.page" :total-pages="pagedEquipment.totalPages" />
            </div>

            <DataTable
                v-if="pagedEquipment.value"
                :columns
                :items="pagedEquipment.value"
                row-key="id"
                :is-loading="isLoading"
                :pager="pager"
            >
                <template #cell-link="{ row }">
                    <LinkButton
                        class="py-0! px-4! flex! items-center justify-center"
                        :to="{ name: equipmentRoutes.view.name, params: { equipmentId: row.id } }"
                    >
                        <ArrowRightIcon />
                    </LinkButton>
                </template>

                <template #cell-icon="{ row }">
                    <div class="flex items-center justify-center">
                        <component
                            :is="SolidIcons[row.icon]"
                            class="size-5 text-text/65 border border-text/20 bg-text/5 rounded-md p-0.5"
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
