<script setup lang="ts">
import { schemas } from "@/api/generated";
import { authRoutes } from "@/features/auth/routes";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import { KeyIcon, UserIcon } from "@heroicons/vue/24/solid";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { useAuthStore } from "../stores/useAuthStore";
import { ref } from "vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import apiClient from "@/api/client";
import router from "@/router";

const isLoading = ref(false);
const authStore = useAuthStore();

const { handleSubmit, errors, defineField } = useForm({
    validationSchema: toTypedSchema(schemas.RegisterRequestDto),
});

const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

const error = ref<string | undefined>();

const onSubmit = handleSubmit(async (values) => {
    isLoading.value = true;
    const response = await apiCall(() => apiClient.postAuthlogin(values));
    isLoading.value = false;

    if (!response.ok) {
        error.value = apiErrorMessage(response.error);
    } else {
        error.value = undefined;
        const { requires2FA, jwtToken, verificationId } = response.data;
        if (jwtToken) {
            authStore.login(jwtToken);
        }

        if (requires2FA) {
            router.push({ name: authRoutes.verification.name, params: { verificationId } });
        } else {
            router.push({ name: "index" });
        }
    }
});
</script>

<template>
    <section class="grid min-h-screen place-items-center">
        <form
            @submit="onSubmit"
            class="bg-surface flex w-full max-w-100 flex-col gap-2 rounded p-8 shadow"
        >
            <h2 class="mb-4 text-center text-xl">Sign in to RoomReservation</h2>
            <ErrorText :error="error" />
            <BaseInput
                floating-label
                has-icon
                v-model="email"
                type="email"
                v-bind="emailAttrs"
                :error-message="errors.email"
                label="Email"
            >
                <template #icon>
                    <UserIcon />
                </template>
            </BaseInput>
            <BaseInput
                floating-label
                has-icon
                v-model="password"
                v-bind="passwordAttrs"
                label="Password"
                type="password"
                :error-message="errors.password"
            >
                <template #icon>
                    <KeyIcon />
                </template>
            </BaseInput>
            <BaseButton :is-loading="isLoading" class="mt-4 justify-center"> Sign in </BaseButton>
            <p class="text-text-muted mt-4 text-center text-sm">
                Don't have account yet?
                <RouterLink :to="{ name: authRoutes.register.name }" class="text-primary">
                    Sign up</RouterLink
                >
            </p>
        </form>
    </section>
</template>
