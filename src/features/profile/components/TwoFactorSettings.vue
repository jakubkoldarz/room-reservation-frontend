<script setup lang="ts">
import { ref } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage, type ApiError } from "@/api/errors";
import PasswordInput from "@/features/auth/components/PasswordInput.vue";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import Badge from "@/features/shared/Badge.vue";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";

const { has2faEnabled } = defineProps<{
    has2faEnabled: boolean;
}>();

const authStore = useAuthStore();
const toasts = useToastsStore();

function isWrongPassword(error: ApiError): boolean {
    return error.kind === "http" && error.status === 400;
}

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
        <h2 class="text-lg font-semibold">Two-step verification</h2>
        <hr class="border-border mt-2 mb-4" />

        <section class="flex flex-col gap-3">
            <div class="flex items-start gap-3">
                <div class="flex min-w-0 flex-col items-start gap-1">
                    <Badge :type="has2faEnabled ? 'success' : 'warning'" class="px-2!">
                        {{ has2faEnabled ? "On" : "Off" }}
                    </Badge>
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
    </Container>
</template>
