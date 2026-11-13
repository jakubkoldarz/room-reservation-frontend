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
import { useListSort } from "@/composables/useListSort";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import { defineFilters } from "@/features/filters/types";
import { useConfirm } from "@/features/modal/composables/useConfirm";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import { isConflict } from "@/features/rooms/utils/conflicts";
import Badge from "@/features/shared/Badge.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import LinkButton from "@/features/shared/LinkButton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import DataTable from "@/features/table/components/DataTable.vue";
import { toSortQueries } from "@/features/table/utils/sort";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { userRoutes } from "@/features/users/routes";
import { roleRoutes } from "../routes";
import type { Role } from "../types";
import { permissionSummary } from "../utils/permissionGroups";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();
const canEdit = hasPermission(Permission.RoleEdit) && hasPermission(Permission.PermissionList);
const canView = hasPermission(Permission.RoleView);
const canAdd = hasPermission(Permission.RoleAdd) && hasPermission(Permission.PermissionList);

const columns = useVisibleColumns(() => [
    { key: "name", label: "Role", align: "left", sortKey: "name" },
    { key: "permissions", label: "Permissions", width: 200, align: "left" },
    {
        key: "users",
        label: "Users",
        width: 160,
        align: "left",
        visible: hasPermission(Permission.UserList),
    },
    {
        key: "delete",
        width: 65,
        align: "center",
        visible: hasPermission(Permission.RoleDelete),
    },
]);

const filters = defineFilters([{ key: "name", type: "text", placeholder: "Role" }]);

const { query, setFilter, clampPage } = useListQuery(
    z.object({ page: pageParam, name: textParam, sort: textParam }),
);

const { sort, toggleSort } = useListSort(
    () => query.value.sort,
    (value) => setFilter("sort", value),
    columns,
    { by: "name", direction: "asc" },
);

const { data, isLoading, error, reload } = usePagedList(
    (q) =>
        apiClient.getRoles({
            queries: {
                Name: q.name.trim() || undefined,
                ...toSortQueries(sort.value),
                Page: q.page,
                PageSize: PAGE_SIZE,
            },
        }),
    query,
);

watch(data, async (page) => {
    if (page) await clampPage(page.totalPages);
});

const confirm = useConfirm();
const toasts = useToastsStore();

async function deleteRole(role: Role): Promise<void> {
    const confirmed = await confirm({
        title: "Delete role?",
        message: `"${role.name}" will be permanently deleted. A role can be deleted only when no user has it.`,
        confirmText: "Delete",
        danger: true,
    });
    if (!confirmed) return;

    const result = await apiCall(() =>
        apiClient.deleteRolesRoleId(undefined, { params: { roleId: role.id } }),
    );
    if (!result.ok && isConflict(result.error)) {
        toasts.pushError({
            title: "Role still has users",
            message: `Give the users of "${role.name}" another role first.`,
        });
        return;
    }
    if (!result.ok) {
        toasts.pushError({
            title: "Failed to delete role",
            message: apiErrorMessage(result.error),
        });
        return;
    }

    toasts.pushSuccess({ title: "Deleted", message: `Role "${role.name}" was deleted` });
    await reload();
}
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div
            class="border-border flex flex-col flex-wrap items-center justify-between gap-2 border-b p-4 @md:flex-row"
        >
            <div class="flex w-full shrink-0 flex-col items-center gap-2 @sm:w-auto @sm:flex-row">
                <LinkButton
                    v-if="canAdd"
                    :to="{ name: roleRoutes.add.name }"
                    class="w-full rounded! py-1.5! sm:max-w-45"
                >
                    <PlusIcon />
                    Add Role
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
            :skeleton-rows="5"
            :sort
            @sort="toggleSort"
        >
            <template #cell-name="{ row }">
                <span class="inline-flex max-w-full flex-wrap items-center gap-2 align-middle">
                    <TextLink
                        v-if="canEdit"
                        :to="{ name: roleRoutes.edit.name, params: { roleId: row.id } }"
                        class="truncate"
                    >
                        {{ row.name }}
                    </TextLink>
                    <TextLink
                        v-else-if="canView"
                        :to="{ name: roleRoutes.view.name, params: { roleId: row.id } }"
                        class="truncate"
                    >
                        {{ row.name }}
                    </TextLink>
                    <span v-else class="text-text truncate font-medium">{{ row.name }}</span>
                    <Badge v-if="row.isDefault" type="success" class="px-2!">Default</Badge>
                    <Badge v-if="row.isSuperAdmin" class="px-2!">Super admin</Badge>
                </span>
            </template>

            <template #cell-permissions="{ row }">
                <span class="text-text-muted text-sm">{{ permissionSummary(row) }}</span>
            </template>

            <template #cell-users="{ row }">
                <TextLink :to="{ name: userRoutes.list.name, query: { role: row.id } }">
                    Show users
                </TextLink>
            </template>

            <template #cell-delete="{ row }">
                <IconButton
                    v-if="!row.isDefault"
                    type="danger"
                    :aria-label="`Delete ${row.name}`"
                    @click="deleteRole(row)"
                >
                    <TrashIcon class="size-4" />
                </IconButton>
            </template>
        </DataTable>
    </Container>
</template>
