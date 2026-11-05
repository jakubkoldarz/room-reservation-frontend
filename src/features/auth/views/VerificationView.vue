<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import BaseButton from "@/features/shared/BaseButton.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import TextLink from "@/features/shared/TextLink.vue";
import AuthLayout from "../components/AuthLayout.vue";
import SegmentedInput from "../components/SegmentedInput.vue";
import { authRoutes } from "../routes";
import { VERIFICATION_CODE_LENGTH } from "../schemas";
import { useAuthStore } from "../stores/useAuthStore";
import { verificationCodeErrorMessage } from "../utils/authErrors";
import { safeRedirect } from "../utils/onboarding";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const verificationId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.params.verificationId);
    return parsed.success ? parsed.data : null;
});
const redirect = computed(() => safeRedirect(route.query.redirect));

watch(
    verificationId,
    (id) => {
        if (!id) void router.replace({ name: authRoutes.login.name });
    },
    { immediate: true },
);

const code = ref("");
const isLoading = ref(false);
const error = ref<string>();
const codeInput = ref<InstanceType<typeof SegmentedInput>>();
const isComplete = computed(() => code.value.length === VERIFICATION_CODE_LENGTH);

async function verify(): Promise<void> {
    if (!verificationId.value || !isComplete.value || isLoading.value) return;

    isLoading.value = true;
    error.value = undefined;
    const response = await apiCall(() =>
        apiClient.postAuthlogin2fa({
            verificationId: verificationId.value!,
            verificationCode: code.value,
        }),
    );

    if (!response.ok) {
        isLoading.value = false;
        error.value = verificationCodeErrorMessage(response.error);
        code.value = "";
        codeInput.value?.focus();
        return;
    }

    await authStore.login(response.data.jwtToken);
    await router.push(redirect.value ?? { name: "index" });
}
</script>

<template>
    <AuthLayout title="Two-step verification">
        <template #description>
            We sent a {{ VERIFICATION_CODE_LENGTH }}-digit code to your email. It is valid for 5
            minutes.
        </template>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="verify">
            <ErrorText :error class="mb-0!" role="alert" />
            <SegmentedInput
                ref="codeInput"
                v-model="code"
                :segments="VERIFICATION_CODE_LENGTH"
                :invalid="!!error"
                :disabled="isLoading"
                autofocus
                @complete="verify"
            />
            <BaseButton
                type="submit"
                :is-loading="isLoading"
                :disabled="!isComplete"
                class="mt-2 justify-center py-2"
            >
                Verify
            </BaseButton>
        </form>

        <template #footer>
            Didn't get the code?
            <TextLink :to="{ name: authRoutes.login.name }" class="text-primary!">
                Sign in again
            </TextLink>
        </template>
    </AuthLayout>
</template>
