<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import PlainButton from "@/features/shared/PlainButton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import AuthLayout from "../components/AuthLayout.vue";
import PasswordResetForm from "../components/PasswordResetForm.vue";
import PasswordResetRequestForm from "../components/PasswordResetRequestForm.vue";
import { authRoutes } from "../routes";
import { VERIFICATION_CODE_LENGTH } from "../schemas";

const router = useRouter();

const email = ref<string | null>(null);

const title = computed(() => {
    if (email.value === null) return "Reset your password";
    return "Set a new password";
});

function showResetStep(address: string): void {
    email.value = address;
}

function showEmailStep(): void {
    email.value = null;
}

async function goToLogin(): Promise<void> {
    await router.push({ name: authRoutes.login.name });
}
</script>

<template>
    <AuthLayout :title>
        <template #description>
            <template v-if="email === null">
                Enter the email of your account. We will send you a code to set a new password.
            </template>
            <template v-else>
                If an account exists for <span class="font-medium break-all">{{ email }}</span
                >, we sent it a {{ VERIFICATION_CODE_LENGTH }}-digit code. It is valid for 15
                minutes.
            </template>
        </template>

        <PasswordResetRequestForm v-if="email === null" @sent="showResetStep" />
        <PasswordResetForm v-else :email @done="goToLogin" />

        <template #footer>
            <template v-if="email === null">
                Remember your password?
                <TextLink :to="{ name: authRoutes.login.name }" class="text-primary!">
                    Sign in
                </TextLink>
            </template>
            <template v-else>
                Wrong email?
                <PlainButton type="button" class="inline-flex!" @click="showEmailStep">
                    Use another address
                </PlainButton>
            </template>
        </template>
    </AuthLayout>
</template>
