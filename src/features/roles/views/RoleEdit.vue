<script setup lang="ts">
import { computed, ref, shallowRef, useTemplateRef, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import RolePermissions from "@/features/profile/components/RolePermissions.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import FormHeader from "@/features/shared/FormHeader.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditRole from "../components/EditRole.vue";
import RolePermissionsPicker from "../components/RolePermissionsPicker.vue";
import { useAllPermissions } from "../composables/useAllPermissions";
import { useRoleSave } from "../composables/useRoleSave";
import { roleRoutes } from "../routes";
import type { Role, RoleForm } from "../types";
import { permissionIdsByName } from "../utils/permissionGroups";
import { isRoleNameTaken } from "../utils/roleErrors";

const route = useRoute();
const router = useRouter();
const toasts = useToastsStore();
const authStore = useAuthStore();
const { hasPermission } = usePermissions();
const form = useTemplateRef("form");

const { permissions, isLoading: isPermissionsLoading } = useAllPermissions();
const { save, isSaving } = useRoleSave();

const roleId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.params.roleId);
    return parsed.success ? parsed.data : null;
});

const canEdit = computed(() => {
    const isEditRoute = route.name === roleRoutes.edit.name;
    return isEditRoute && hasPermission(Permission.PermissionList);
});
const headerMode = computed(() => (canEdit.value ? "edit" : "view"));

const role = shallowRef<Role | null>(null);
const loadError = ref<string | null>(null);
const isLoading = ref(false);
const permissionIds = ref<string[]>([]);

const roleInfo = computed(() => {
    if (!role.value) return { role: "", permissions: [] };
    return { role: role.value.name, permissions: role.value.permissions };
});

async function load(id: string | null): Promise<void> {
    role.value = null;
    loadError.value = null;
    if (!id) {
        loadError.value = "Role not found.";
        return;
    }

    isLoading.value = true;
    const result = await apiCall(() => apiClient.getRolesRoleId({ params: { roleId: id } }));
    isLoading.value = false;

    if (result.ok) {
        role.value = result.data;
    } else {
        loadError.value = apiErrorMessage(result.error);
    }
}

watch(roleId, load, { immediate: true });

watch(
    [role, permissions],
    () => {
        if (!role.value) return;
        permissionIds.value = permissionIdsByName(permissions.value, role.value.permissions);
    },
    { immediate: true },
);

function goToList() {
    return router.push({ name: roleRoutes.list.name });
}

async function updateRole(id: string, values: RoleForm, force: boolean) {
    return await apiCall(() =>
        apiClient.putRolesRoleId(
            {
                name: values.name,
                isDefault: values.isDefault,
                isSuperAdmin: values.isSuperAdmin,
                permissionIds: permissionIds.value,
            },
            { params: { roleId: id }, queries: { force } },
        ),
    );
}

async function handleSave(): Promise<void> {
    const id = roleId.value;
    if (!id || !form.value || !canEdit.value) return;
    if (isPermissionsLoading.value) return;

    const values = await form.value.submit();
    if (!values) return;

    const savedRoleId: string = id;
    const roleForm: RoleForm = values;

    async function send(force: boolean) {
        return await updateRole(savedRoleId, roleForm, force);
    }

    const result = await save(send);
    if (!result) return;

    if (result.ok) {
        toasts.pushSuccess({ title: "Success", message: `Role "${result.data.name}" updated` });
        await authStore.init();
        await goToList();
        return;
    }

    if (result.error.kind === "validation") {
        form.value.showServerErrors(result.error.fieldErrors);
    }
    if (isRoleNameTaken(result.error)) {
        form.value.showNameError("A role with this name already exists");
    }
    toasts.pushError({ title: "Failed to update role", message: apiErrorMessage(result.error) });
}
</script>

<template>
    <div class="flex flex-col gap-4 pb-20">
        <ErrorText v-if="loadError" :error="loadError" />
        <template v-else>
            <FormHeader
                :mode="headerMode"
                :title="role?.name"
                :is-loading
                :is-saving
                @cancel="goToList"
                @save="handleSave"
            />
            <template v-if="role">
                <EditRole ref="form" :key="role.id" :role :readonly="!canEdit">
                    <template v-if="canEdit">
                        Changes apply to every user with this role the next time they open the app.
                    </template>
                    <template v-else>Details of the role.</template>
                </EditRole>
                <RolePermissionsPicker
                    v-if="canEdit"
                    v-model="permissionIds"
                    :permissions
                    :is-loading="isPermissionsLoading"
                />
                <RolePermissions v-else :role-info="roleInfo" />
            </template>
            <template v-else-if="isLoading">
                <Container v-for="n in 2" :key="n" class="flex animate-pulse flex-col gap-3">
                    <Skeleton class="w-1/3" />
                    <Skeleton v-for="line in 4" :key="line" class="w-full" />
                </Container>
            </template>
        </template>
    </div>
</template>
