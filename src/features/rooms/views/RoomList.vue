<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from "vue";
import { z } from "zod";
import { BuildingOfficeIcon, TrashIcon } from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { pageParam, textParam, useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import type { Building } from "@/features/buildings/types";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import { defineFilters, type Filter } from "@/features/filters/types";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import Badge from "@/features/shared/Badge.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { useRoomsStore } from "../stores/useRoomsStore";
import type { BasicRoom } from "../types";

const PAGE_SIZE = 25;
const BUILDINGS_PAGE_SIZE = 100;

const { hasPermission } = usePermissions();

const columns = useVisibleColumns(() => [
    { key: "identifier", label: "Identifier", align: "left" },
    { key: "floor", label: "Floor", width: 100, align: "center" },
    { key: "capacity", label: "Capacity", width: 120, align: "center" },
    { key: "approval", label: "Approval", width: 160, align: "center" },
    {
        key: "delete",
        width: 65,
        align: "center",
        visible: hasPermission(Permission.RoomDelete),
    },
]);

const buildings = shallowRef<readonly Building[]>([]);

const filters = computed(() =>
    defineFilters([
        { key: "identifier", type: "text", placeholder: "Room identifier" },
        ...(hasPermission(Permission.BuildingList)
            ? [
                  {
                      key: "building",
                      type: "select",
                      placeholder: "Building",
                      icon: BuildingOfficeIcon,
                      values: buildings.value.map((b) => ({ value: b.id, label: b.name })),
                  } satisfies Filter<"building">,
              ]
            : []),
    ]),
);

const uuidParam = z.preprocess((v) => (Array.isArray(v) ? v[0] : v), z.string().uuid()).catch("");

const { query, setFilter, clampPage } = useListQuery(
    z.object({ page: pageParam, identifier: textParam, building: uuidParam }),
);

const { data, isLoading, error, reload } = usePagedList(
    (q) =>
        apiClient.getRooms({
            queries: {
                Identifier: q.identifier.trim() || undefined,
                BuildingId: q.building || undefined,
                Page: q.page,
                PageSize: PAGE_SIZE,
            },
        }),
    query,
);

watch(data, (page) => {
    if (page) void clampPage(page.totalPages);
});

const toasts = useToastsStore();

onMounted(async () => {
    if (!hasPermission(Permission.BuildingList)) return;
    const result = await apiCall(() =>
        apiClient.getBuildings({ queries: { PageSize: BUILDINGS_PAGE_SIZE } }),
    );
    if (result.ok) buildings.value = result.data.items;
    else
        toasts.pushError({
            title: "Failed to load buildings",
            message: apiErrorMessage(result.error),
        });
});

const confirm = useConfirm();
const roomsStore = useRoomsStore();

async function deleteRoom(room: BasicRoom): Promise<void> {
    const confirmed = await confirm({
        title: "Delete room?",
        message: `"${room.identifier}" will be permanently deleted. This cannot be undone.`,
        confirmText: "Delete",
        danger: true,
    });
    if (!confirmed) return;

    const result = await apiCall(() =>
        apiClient.deleteRoomsRoomId(undefined, { params: { roomId: room.id } }),
    );
    if (!result.ok) {
        toasts.pushError({
            title: "Failed to delete room",
            message: apiErrorMessage(result.error),
        });
        return;
    }

    toasts.pushSuccess({ title: "Deleted", message: `Room "${room.identifier}" was deleted` });
    await reload();
    roomsStore.fetchRooms();
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
                <template #cell-identifier="{ row }">
                    <Badge class="inline-flex!">{{ row.identifier }}</Badge>
                </template>

                <template #cell-floor="{ row }">
                    {{ row.floor }}
                </template>

                <template #cell-capacity="{ row }">
                    {{ row.capacity }}
                </template>

                <template #cell-approval="{ row }">
                    <Badge
                        :type="row.requiresApproval ? 'warning' : 'success'"
                        class="inline-flex!"
                    >
                        {{ row.requiresApproval ? "Required" : "Not required" }}
                    </Badge>
                </template>

                <template #cell-delete="{ row }">
                    <IconButton type="danger" @click="deleteRoom(row)">
                        <TrashIcon class="size-4" />
                    </IconButton>
                </template>
            </DataTable>
        </Container>
    </AsideNavbarLayout>
</template>
