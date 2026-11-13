<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import FormHeader from "@/features/shared/FormHeader.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import EditRole from "../components/EditRole.vue";
import RolePermissionsPicker from "../components/RolePermissionsPicker.vue";
import { useAllPermissions } from "../composables/useAllPermissions";
import { useRoleSave } from "../composables/useRoleSave";
import { roleRoutes } from "../routes";
import type { RoleForm } from "../types";
import { isRoleNameTaken } from "../utils/roleErrors";

const router = useRouter();
const toasts = useToastsStore();
const form = useTemplateRef("form");

const { permissions, isLoading: isPermissionsLoading } = useAllPermissions();
const { save, isSaving } = useRoleSave();
const permissionIds = ref<string[]>([]);

function goToList() {
    return router.push({ name: roleRoutes.list.name });
}

async function createRole(values: RoleForm, force: boolean) {
    return await apiCall(() =>
        apiClient.postRoles(
            {
                name: values.name,
                isDefault: values.isDefault,
                isSuperAdmin: values.isSuperAdmin,
                permissionIds: permissionIds.value,
            },
            { queries: { force } },
        ),
    );
}

async function handleSave(): Promise<void> {
    if (!form.value) return;
    const values = await form.value.submit();
    if (!values) return;

    const roleForm: RoleForm = values;

    async function send(force: boolean) {
        return await createRole(roleForm, force);
    }

    const result = await save(send);
    if (!result) return;

    if (result.ok) {
        toasts.pushSuccess({ title: "Success", message: `Role "${result.data.name}" created` });
        await goToList();
        return;
    }

    if (result.error.kind === "validation") {
        form.value.showServerErrors(result.error.fieldErrors);
    }
    if (isRoleNameTaken(result.error)) {
        form.value.showNameError("A role with this name already exists");
    }
    toasts.pushError({ title: "Failed to create role", message: apiErrorMessage(result.error) });
}
</script>

<template>
    <div class="flex flex-col gap-4 pb-20">
        <FormHeader mode="create" :is-saving @cancel="goToList" @save="handleSave" />
        <EditRole ref="form">
            Name the role and decide how it is used. Roles are assigned to users on the Users page.
        </EditRole>
        <RolePermissionsPicker
            v-model="permissionIds"
            :permissions
            :is-loading="isPermissionsLoading"
        />
    </div>
</template>
