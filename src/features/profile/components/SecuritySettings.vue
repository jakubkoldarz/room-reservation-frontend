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
import OutlineButton from "@/features/shared/OutlineButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { ChangePasswordFormSchema } from "../schemas";

const { has2faEnabled } = defineProps<{
    has2faEnabled: boolean;
}>();

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

const isTogglingTwoFactor = ref(false);
const isDisableFormOpen = ref(false);
const disablePassword = ref("");
const disableError = ref<string>();

async function enableTwoFactor(): Promise<void> {
    isTogglingTwoFactor.value = true;
    const response = await apiCall(() => apiClient.postAuth2faenable(undefined));
    isTogglingTwoFactor.value = false;

    if (!response.ok) {
        toasts.pushError({
            title: "Failed to turn on",
            message: apiErrorMessage(response.error),
        });
        return;
    }

    await authStore.init();
    toasts.pushSuccess({
        title: "Two-step verification on",
        message: "Next time you sign in, we will email you a code.",
    });
}

async function disableTwoFactor(): Promise<void> {
    if (!disablePassword.value) {
        disableError.value = "Enter your password";
        return;
    }

    isTogglingTwoFactor.value = true;
    disableError.value = undefined;
    const response = await apiCall(() =>
        apiClient.postAuth2fadisable({ password: disablePassword.value }),
    );
    isTogglingTwoFactor.value = false;

    if (!response.ok) {
        disableError.value = isWrongPassword(response.error)
            ? "Password is incorrect"
            : apiErrorMessage(response.error);
        return;
    }

    closeDisableForm();
    await authStore.init();
    toasts.pushSuccess({ title: "Two-step verification off", message: "Codes are not required." });
}

function closeDisableForm(): void {
    isDisableFormOpen.value = false;
    disablePassword.value = "";
    disableError.value = undefined;
}
</script>

<template>
    <Container>
        <h2 class="text-lg font-semibold">Security</h2>
        <hr class="border-border mt-2 mb-4" />

        <section class="flex flex-col gap-3">
            <div class="flex items-start gap-3">
                <div class="flex min-w-0 flex-col">
                    <h3 class="text-sm font-semibold">Two-step verification</h3>
                    <p class="text-text-muted text-xs">
                        {{
                            has2faEnabled
                                ? "A code from email is required when you sign in."
                                : "Sign in with your password only."
                        }}
                    </p>
                </div>
                <BaseButton
                    v-if="!has2faEnabled"
                    type="button"
                    class="ml-auto shrink-0"
                    :is-loading="isTogglingTwoFactor"
                    @click="enableTwoFactor"
                >
                    Turn on
                </BaseButton>
                <OutlineButton
                    v-else-if="!isDisableFormOpen"
                    type="button"
                    class="ml-auto shrink-0"
                    @click="isDisableFormOpen = true"
                >
                    Turn off
                </OutlineButton>
            </div>

            <form
                v-if="has2faEnabled && isDisableFormOpen"
                class="bg-background border-border flex flex-col gap-3 rounded border p-3"
                novalidate
                @submit.prevent="disableTwoFactor"
            >
                <PasswordInput
                    v-model="disablePassword"
                    label="Your password"
                    autocomplete="current-password"
                    :error-message="disableError"
                />
                <div class="flex justify-end gap-2">
                    <OutlineButton type="button" @click="closeDisableForm">Cancel</OutlineButton>
                    <BaseButton type="submit" :is-loading="isTogglingTwoFactor"
                        >Turn off</BaseButton
                    >
                </div>
            </form>
        </section>

        <hr class="border-border my-4" />

        <form class="flex flex-col gap-3" novalidate @submit="changePassword">
            <h3 class="text-sm font-semibold">Change password</h3>
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
