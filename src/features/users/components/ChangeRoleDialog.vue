<script setup lang="ts">
import { computed, ref, useId, useTemplateRef, watch } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { formatUserName } from "@/features/reservations/utils/reservationState";
import type { Role } from "@/features/roles/types";
import { permissionSummary } from "@/features/roles/utils/permissionGroups";
import BaseButton from "@/features/shared/BaseButton.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { UserListItem } from "../types";

const {
    open,
    user,
    roles,
    isLoading = false,
} = defineProps<{
    open: boolean;
    user: UserListItem | null;
    roles: readonly Role[];
    isLoading?: boolean;
}>();

const emit = defineEmits<{
    close: [];
    changed: [];
}>();

const dialog = useTemplateRef("dialog");
const titleId = useId();
const groupName = useId();
const toasts = useToastsStore();

const selectedRoleId = ref("");
const isSaving = ref(false);
const formError = ref<string>();

const userName = computed(() => {
    if (!user) return "";
    return formatUserName(user.userInfo);
});

const isSameRole = computed(() => {
    if (!user) return true;
    return selectedRoleId.value === user.roleInfo.id;
});

watch(
    () => open,
    (isOpen) => {
        const element = dialog.value;
        if (!element) return;

        if (isOpen) {
            formError.value = undefined;
            selectedRoleId.value = user?.roleInfo.id ?? "";
            if (!element.open) element.showModal();
        } else if (element.open) {
            element.close();
        }
    },
);

function roleNameOf(roleId: string): string {
    for (const role of roles) {
        if (role.id === roleId) return role.name;
    }
    return "";
}

async function submit(): Promise<void> {
    if (!user || isSameRole.value || isSaving.value) return;

    const userId = user.userInfo.id;
    const roleId = selectedRoleId.value;
    formError.value = undefined;

    isSaving.value = true;
    const result = await apiCall(() =>
        apiClient.postRolesRoleIdassign(undefined, { params: { roleId }, queries: { userId } }),
    );
    isSaving.value = false;

    if (!result.ok) {
        formError.value = apiErrorMessage(result.error);
        return;
    }

    toasts.pushSuccess({
        title: "Role changed",
        message: `${userName.value} is now ${roleNameOf(roleId)}.`,
    });
    emit("changed");
}
</script>

<template>
    <dialog
        ref="dialog"
        :aria-labelledby="titleId"
        class="bg-surface text-text border-border mx-0 mt-auto mb-0 w-full max-w-none rounded-t-xl border p-0 shadow-lg backdrop:bg-black/30 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md sm:rounded-xl"
        @close="emit('close')"
        @click.self="emit('close')"
    >
        <form class="flex flex-col gap-4 p-4 sm:p-6" novalidate @submit.prevent="submit">
            <div class="flex flex-col gap-1">
                <h2 :id="titleId" class="text-lg font-semibold">Change role</h2>
                <p class="text-sm font-medium">{{ userName }}</p>
                <p class="text-text-muted text-sm break-all">{{ user?.email }}</p>
            </div>

            <ErrorText :error="formError" class="mb-0! text-left" role="alert" />

            <div v-if="isLoading" class="flex flex-col gap-2">
                <Skeleton v-for="n in 4" :key="n" class="h-12 w-full" />
            </div>
            <div
                v-else
                role="radiogroup"
                :aria-labelledby="titleId"
                class="flex max-h-80 flex-col gap-2 overflow-y-auto p-0.5"
            >
                <label
                    v-for="role in roles"
                    :key="role.id"
                    class="has-focus-visible:ring-primary flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 transition-colors has-focus-visible:ring-2"
                    :class="
                        selectedRoleId === role.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/40'
                    "
                >
                    <input
                        v-model="selectedRoleId"
                        type="radio"
                        :name="groupName"
                        :value="role.id"
                        class="accent-primary size-4 shrink-0 cursor-pointer outline-none"
                    />
                    <span class="flex min-w-0 flex-col">
                        <span class="truncate text-sm font-semibold">{{ role.name }}</span>
                        <span class="text-text-muted text-xs">{{ permissionSummary(role) }}</span>
                    </span>
                </label>
            </div>

            <p class="text-text-muted text-xs">
                The new permissions apply the next time this user opens the app.
            </p>

            <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <OutlineButton
                    type="button"
                    class="justify-center py-2 sm:py-1"
                    @click="emit('close')"
                >
                    Cancel
                </OutlineButton>
                <BaseButton
                    type="submit"
                    :is-loading="isSaving"
                    :disabled="isSameRole"
                    class="justify-center py-2 sm:py-1"
                >
                    Change role
                </BaseButton>
            </div>
        </form>
    </dialog>
</template>
