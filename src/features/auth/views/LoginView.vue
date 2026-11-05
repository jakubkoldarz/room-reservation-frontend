<script setup lang="ts">
import { EnvelopeIcon } from "@heroicons/vue/24/solid";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import TextLink from "@/features/shared/TextLink.vue";
import AuthLayout from "../components/AuthLayout.vue";
import PasswordInput from "../components/PasswordInput.vue";
import { authRoutes } from "../routes";
import { LoginFormSchema } from "../schemas";
import { useAuthStore } from "../stores/useAuthStore";
import { credentialsErrorMessage } from "../utils/authErrors";
import { safeRedirect } from "../utils/onboarding";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref<string>();
const redirect = computed(() => safeRedirect(route.query.redirect));

const { handleSubmit, errors, defineField, setErrors } = useForm({
    validationSchema: toTypedSchema(LoginFormSchema),
});
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

const onSubmit = handleSubmit(async (values) => {
    isLoading.value = true;
    error.value = undefined;

    const response = await apiCall(() => apiClient.postAuthlogin(values));
    if (!response.ok) {
        isLoading.value = false;
        if (response.error.kind === "validation") {
            const { fieldErrors } = response.error;
            setErrors({ email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] });
        }
        error.value = credentialsErrorMessage(response.error);
        return;
    }

    const { requires2FA, jwtToken, verificationId } = response.data;
    if (requires2FA && verificationId) {
        await router.push({
            name: authRoutes.verification.name,
            params: { verificationId },
            query: redirect.value ? { redirect: redirect.value } : {},
        });
        return;
    }
    if (jwtToken) {
        await authStore.login(jwtToken);
        await router.push(redirect.value ?? { name: "index" });
        return;
    }

    isLoading.value = false;
    error.value = "Something went wrong. Please try again.";
});
</script>

<template>
    <AuthLayout title="Sign in">
        <form class="flex flex-col gap-4" novalidate @submit="onSubmit">
            <ErrorText :error class="mb-0!" role="alert" />
            <BaseInput
                v-model="email"
                v-bind="emailAttrs"
                type="email"
                label="Email"
                autocomplete="email"
                :error-message="errors.email"
                floating-label
                has-icon
            >
                <template #icon>
                    <EnvelopeIcon />
                </template>
            </BaseInput>
            <PasswordInput
                v-model="password"
                v-bind="passwordAttrs"
                label="Password"
                autocomplete="current-password"
                :error-message="errors.password"
            />
            <BaseButton type="submit" :is-loading="isLoading" class="mt-2 justify-center py-2">
                Sign in
            </BaseButton>
        </form>

        <template #footer>
            Don't have an account yet?
            <TextLink :to="{ name: authRoutes.register.name }" class="text-primary!">
                Create one
            </TextLink>
        </template>
    </AuthLayout>
</template>
