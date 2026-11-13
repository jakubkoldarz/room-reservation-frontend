<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { EnvelopeIcon, PencilSquareIcon, ShieldCheckIcon } from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiErrorMessage } from "@/api/errors";
import { useListQuery } from "@/composables/useListQuery";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { useListSort } from "@/composables/useListSort";
import { useVisibleColumns } from "@/composables/useVisibleColumns";
import { Permission } from "@/features/auth/constants/permissions";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import FiltersPanel from "@/features/filters/components/FiltersPanel.vue";
import type { Filter } from "@/features/filters/types";
import PagerBlock from "@/features/pager/components/PagerBlock.vue";
import { formatUserName } from "@/features/reservations/utils/reservationState";
import { useAllRoles } from "@/features/roles/composables/useAllRoles";
import Badge from "@/features/shared/Badge.vue";
import BaseTooltip from "@/features/shared/BaseTooltip.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import IconButton from "@/features/shared/IconButton.vue";
import type { SelectOption } from "@/features/shared/types";
import DataTable from "@/features/table/components/DataTable.vue";
import { toSortQueries } from "@/features/table/utils/sort";
import ChangeRoleDialog from "../components/ChangeRoleDialog.vue";
import { UserListQuerySchema } from "../schemas";
import type { UserListItem } from "../types";
import { toUserQueries } from "../utils/userQueries";

type UserFilterKey = "lastname" | "firstname" | "email" | "role";

const PAGE_SIZE = 25;

const { hasPermission } = usePermissions();
const authStore = useAuthStore();
const canSeeRoles = hasPermission(Permission.RoleList);
const canAssign = hasPermission(Permission.RoleAssign) && canSeeRoles;

const { roles, isLoading: isRolesLoading } = useAllRoles();

const columns = useVisibleColumns(() => [
    { key: "name", label: "User", align: "left", sortKey: "lastname" },
    { key: "email", label: "Email", align: "left", sortKey: "email" },
    { key: "role", label: "Role", width: 200, align: "left", sortKey: "role" },
    { key: "actions", width: 65, align: "center", visible: canAssign },
]);

const roleOptions = computed(() => {
    const options: SelectOption[] = [];
    for (const role of roles.value) {
        options.push({ value: role.id, label: role.name });
    }
    return options;
});

const filters = computed(() => {
    const list: Filter<UserFilterKey>[] = [
        { key: "lastname", type: "text", placeholder: "Last name" },
        { key: "firstname", type: "text", placeholder: "First name" },
        { key: "email", type: "text", placeholder: "Email", icon: EnvelopeIcon },
    ];
    if (canSeeRoles) {
        list.push({
            key: "role",
            type: "select",
            placeholder: "Role",
            icon: ShieldCheckIcon,
            values: roleOptions.value,
        });
    }
    return list;
});

const { query, setFilter, clampPage } = useListQuery(UserListQuerySchema);

const { sort, toggleSort } = useListSort(
    () => query.value.sort,
    (value) => setFilter("sort", value),
    columns,
    { by: "lastname", direction: "asc" },
);

const { data, isLoading, error, reload } = usePagedList(
    (q) =>
        apiClient.getUsers({
            queries: {
                ...toUserQueries(q, PAGE_SIZE),
                ...toSortQueries(sort.value),
            },
        }),
    query,
);

watch(data, async (page) => {
    if (page) await clampPage(page.totalPages);
});

function userId(item: UserListItem): string {
    return item.userInfo.id;
}

function isCurrentUser(item: UserListItem): boolean {
    const currentUser = authStore.user;
    if (!currentUser) return false;
    return currentUser.userInfo.id === item.userInfo.id;
}

const editedUser = shallowRef<UserListItem | null>(null);
const isDialogOpen = ref(false);

function openRoleDialog(item: UserListItem): void {
    editedUser.value = item;
    isDialogOpen.value = true;
}

function closeRoleDialog(): void {
    isDialogOpen.value = false;
}

async function handleRoleChanged(): Promise<void> {
    isDialogOpen.value = false;
    await reload();
}
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div
            class="border-border flex flex-col flex-wrap items-center justify-between gap-2 border-b p-4 @md:flex-row"
        >
            <FiltersPanel
                :filters
                :values="query"
                class="w-full shrink-0 @sm:w-auto"
                @change="setFilter"
            />
            <PagerBlock :current="query.page" :total="data?.totalPages ?? 1" />
        </div>

        <ErrorText v-if="error" :error="apiErrorMessage(error)" class="mt-4" />

        <DataTable
            :columns
            :items="data?.items ?? []"
            :row-key="userId"
            :is-loading="isLoading"
            :skeleton-rows="PAGE_SIZE"
            :sort
            @sort="toggleSort"
        >
            <template #cell-name="{ row }">
                <span class="inline-flex max-w-full items-center gap-2 align-middle">
                    <span class="text-text truncate font-medium">
                        {{ formatUserName(row.userInfo) }}
                    </span>
                    <Badge v-if="isCurrentUser(row)" class="px-2!">You</Badge>
                </span>
            </template>

            <template #cell-email="{ row }">
                <span class="text-text-muted truncate text-sm">{{ row.email }}</span>
            </template>

            <template #cell-role="{ row }">
                <span class="text-text text-sm">{{ row.roleInfo.name }}</span>
            </template>

            <template #cell-actions="{ row }">
                <BaseTooltip v-if="!isCurrentUser(row)" text="Change role">
                    <IconButton
                        :aria-label="`Change role of ${formatUserName(row.userInfo)}`"
                        @click="openRoleDialog(row)"
                    >
                        <PencilSquareIcon class="size-5" />
                    </IconButton>
                </BaseTooltip>
            </template>
        </DataTable>

        <ChangeRoleDialog
            :open="isDialogOpen"
            :user="editedUser"
            :roles
            :is-loading="isRolesLoading"
            @close="closeRoleDialog"
            @changed="handleRoleChanged"
        />
    </Container>
</template>
