<script setup lang="ts">
import { useIntervalFn } from "@vueuse/core";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import BaseButton from "@/features/shared/BaseButton.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import AuthLayout from "../components/AuthLayout.vue";
import SegmentedInput from "../components/SegmentedInput.vue";
import { useSignOut } from "../composables/useSignOut";
import { VERIFICATION_CODE_LENGTH } from "../schemas";
import { useAuthStore } from "../stores/useAuthStore";
import { authErrorMessage, verificationCodeErrorMessage } from "../utils/authErrors";

const RESEND_COOLDOWN_SECONDS = 60;

const router = useRouter();
const authStore = useAuthStore();
const toasts = useToastsStore();
const { signOut, isSigningOut } = useSignOut();

const historyEmail: unknown = window.history.state?.email;
const email = typeof historyEmail === "string" ? historyEmail : null;

const code = ref("");
const isVerifying = ref(false);
const isResending = ref(false);
const error = ref<string>();
const codeInput = ref<InstanceType<typeof SegmentedInput>>();
const isComplete = computed(() => code.value.length === VERIFICATION_CODE_LENGTH);

const cooldown = ref(email ? RESEND_COOLDOWN_SECONDS : 0);
const { pause, resume } = useIntervalFn(
    () => {
        cooldown.value = Math.max(cooldown.value - 1, 0);
        if (cooldown.value === 0) pause();
    },
    1000,
    { immediate: cooldown.value > 0 },
);

async function continueOnboarding(): Promise<void> {
    await authStore.init();
    await router.push({ name: "index" });
}

async function verify(): Promise<void> {
    if (!isComplete.value || isVerifying.value) return;

    isVerifying.value = true;
    error.value = undefined;
    const response = await apiCall(() =>
        apiClient.postAuthemailconfirmationverify({ verificationCode: code.value }),
    );

    if (!response.ok) {
        isVerifying.value = false;
        error.value = verificationCodeErrorMessage(response.error);
        code.value = "";
        codeInput.value?.focus();
        return;
    }

    toasts.pushSuccess({ title: "Email confirmed", message: "Your email address is verified." });
    await continueOnboarding();
}

async function resend(): Promise<void> {
    if (cooldown.value > 0 || isResending.value) return;

    isResending.value = true;
    error.value = undefined;
    const response = await apiCall(() => apiClient.postAuthemailconfirmation(undefined));
    isResending.value = false;

    if (!response.ok) {
        if (response.error.kind === "http" && response.error.status === 400) {
            await continueOnboarding();
            return;
        }
        error.value = authErrorMessage(response.error);
        return;
    }

    code.value = "";
    codeInput.value?.focus();
    toasts.pushInfo({ title: "Code sent", message: "Check your inbox for a new code." });
    cooldown.value = RESEND_COOLDOWN_SECONDS;
    resume();
}
</script>

<template>
    <AuthLayout title="Confirm your email" :step="1" :total-steps="2">
        <template #description>
            We sent a {{ VERIFICATION_CODE_LENGTH }}-digit code to
            <span v-if="email" class="font-medium">{{ email }}</span>
            <template v-else>your email address</template>. Enter it below to activate your account.
            The code expires in 15 minutes.
        </template>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="verify">
            <ErrorText :error class="mb-0!" role="alert" />
            <SegmentedInput
                ref="codeInput"
                v-model="code"
                :segments="VERIFICATION_CODE_LENGTH"
                :invalid="!!error"
                :disabled="isVerifying"
                autofocus
                @complete="verify"
            />
            <BaseButton
                type="submit"
                :is-loading="isVerifying"
                :disabled="!isComplete"
                class="mt-2 justify-center py-2"
            >
                Confirm email
            </BaseButton>
        </form>

        <div class="mt-5 flex flex-wrap items-center justify-center gap-x-1 text-sm">
            <span class="text-text-muted">Didn't get the code?</span>
            <PlainButton
                type="button"
                :is-loading="isResending"
                :disabled="cooldown > 0"
                @click="resend"
            >
                {{ cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code" }}
            </PlainButton>
        </div>

        <template #footer>
            Wrong account?
            <PlainButton
                type="button"
                class="inline-flex!"
                :is-loading="isSigningOut"
                @click="signOut"
            >
                Sign out
            </PlainButton>
        </template>
    </AuthLayout>
</template>
