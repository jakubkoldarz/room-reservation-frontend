<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage, type ApiError } from "@/api/errors";
import PasswordInput from "@/features/auth/components/PasswordInput.vue";
import { authRoutes } from "@/features/auth/routes";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { ChangePasswordFormSchema } from "../schemas";

const router = useRouter();
const authStore = useAuthStore();
const toasts = useToastsStore();

function isWrongPassword(error: ApiError): boolean {
    return error.kind === "http" && error.status === 400;
}

const isChangingPassword = ref(false);
const { handleSubmit, errors, defineField, setFieldError } = useForm({
    validationSchema: toTypedSchema(ChangePasswordFormSchema),
});
const [oldPassword, oldPasswordAttrs] = defineField("oldPassword");
const [newPassword, newPasswordAttrs] = defineField("newPassword");
const [confirmPassword, confirmPasswordAttrs] = defineField("confirmPassword");

const changePassword = handleSubmit(async (values) => {
    isChangingPassword.value = true;
    const response = await apiCall(() =>
        apiClient.patchAuthpassword({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
        }),
    );
    isChangingPassword.value = false;

    if (!response.ok) {
        if (isWrongPassword(response.error)) {
            setFieldError("oldPassword", "Current password is incorrect");
        } else {
            toasts.pushError({
                title: "Failed to change password",
                message: apiErrorMessage(response.error),
            });
        }
        return;
    }

    await authStore.logout();
    toasts.pushSuccess({
        title: "Password changed",
        message: "All sessions were signed out. Sign in with the new password.",
    });
    await router.push({ name: authRoutes.login.name });
});
</script>

<template>
    <Container>
        <h2 class="text-lg font-semibold">Change password</h2>
        <hr class="border-border mt-2 mb-4" />

        <form class="flex flex-col gap-3" novalidate @submit="changePassword">
            <PasswordInput
                v-model="oldPassword"
                v-bind="oldPasswordAttrs"
                label="Current password"
                autocomplete="current-password"
                :error-message="errors.oldPassword"
            />
            <PasswordInput
                v-model="newPassword"
                v-bind="newPasswordAttrs"
                label="New password"
                autocomplete="new-password"
                :error-message="errors.newPassword"
            />
            <PasswordInput
                v-model="confirmPassword"
                v-bind="confirmPasswordAttrs"
                label="Repeat new password"
                autocomplete="new-password"
                :error-message="errors.confirmPassword"
            />
            <p class="text-text-muted text-xs">You will be signed out of all sessions.</p>
            <BaseButton type="submit" :is-loading="isChangingPassword" class="self-end">
                Change password
            </BaseButton>
        </form>
    </Container>
</template>
