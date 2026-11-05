<script setup lang="ts">
import { EnvelopeIcon } from "@heroicons/vue/24/solid";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import TextLink from "@/features/shared/TextLink.vue";
import AuthLayout from "../components/AuthLayout.vue";
import PasswordInput from "../components/PasswordInput.vue";
import { authRoutes } from "../routes";
import { MIN_PASSWORD_LENGTH, RegisterFormSchema } from "../schemas";
import { useAuthStore } from "../stores/useAuthStore";
import { authErrorMessage, isEmailTaken } from "../utils/authErrors";

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(false);
const error = ref<string>();

const { handleSubmit, errors, defineField, setErrors, setFieldError } = useForm({
    validationSchema: toTypedSchema(RegisterFormSchema),
});
const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");
const [confirmPassword, confirmPasswordAttrs] = defineField("confirmPassword");

const onSubmit = handleSubmit(async (values) => {
    isLoading.value = true;
    error.value = undefined;

    const response = await apiCall(() =>
        apiClient.postAuthregister({ email: values.email, password: values.password }),
    );
    if (!response.ok) {
        isLoading.value = false;
        const apiError = response.error;
        if (apiError.kind === "validation") {
            setErrors({
                email: apiError.fieldErrors.email?.[0],
                password: apiError.fieldErrors.password?.[0],
            });
        } else if (isEmailTaken(apiError)) {
            setFieldError("email", "An account with this email already exists");
        } else {
            error.value = authErrorMessage(apiError);
        }
        return;
    }

    await authStore.login(response.data.jwtToken);
    await router.push({ name: authRoutes.verifyEmail.name, state: { email: values.email } });
});
</script>

<template>
    <AuthLayout title="Create an account" description="You will get a confirmation code by email.">
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
            <div class="flex flex-col gap-1">
                <PasswordInput
                    v-model="password"
                    v-bind="passwordAttrs"
                    label="Password"
                    autocomplete="new-password"
                    :error-message="errors.password"
                />
                <p v-if="!errors.password" class="text-text-muted text-xs">
                    Use at least {{ MIN_PASSWORD_LENGTH }} characters.
                </p>
            </div>
            <PasswordInput
                v-model="confirmPassword"
                v-bind="confirmPasswordAttrs"
                label="Repeat password"
                autocomplete="new-password"
                :error-message="errors.confirmPassword"
            />
            <BaseButton type="submit" :is-loading="isLoading" class="mt-2 justify-center py-2">
                Create account
            </BaseButton>
        </form>

        <template #footer>
            Already have an account?
            <TextLink :to="{ name: authRoutes.login.name }" class="text-primary!">Sign in</TextLink>
        </template>
    </AuthLayout>
</template>
