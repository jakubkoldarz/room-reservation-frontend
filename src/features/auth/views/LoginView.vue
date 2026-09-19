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
import { useApiCall } from "@/composables/useApiCall";
import apiClient from "@/api/client";
import router from "@/router";

const { call, isLoading } = useApiCall();
const authStore = useAuthStore();

const { handleSubmit, errors, defineField } = useForm({
    validationSchema: toTypedSchema(schemas.RegisterRequestDto),
});

const [email, emailAttrs] = defineField("email");
const [password, passwordAttrs] = defineField("password");

const error = ref<string | undefined>();

const onSubmit = handleSubmit(async (values) => {
    const response = await call(() => apiClient.postAuthlogin(values));
    if (!response.success) {
        error.value = response.error?.message ?? "Unknown error occured";
    } else {
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
    <section class="grid place-items-center min-h-screen">
        <form @submit="onSubmit" class="p-8 flex flex-col gap-2 shadow rounded bg-surface w-full max-w-100">
            <h2 class="text-xl mb-4 text-center">Sign in to RoomReservation</h2>
            <ErrorText :error="error" />
            <BaseInput v-model="email" type="email" v-bind="emailAttrs" :error-message="errors.email" label="Email">
                <template #icon>
                    <UserIcon />
                </template>
            </BaseInput>
            <BaseInput
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
            <p class="text-sm text-text-muted text-center mt-4">
                Don't have account yet?
                <RouterLink :to="{ name: authRoutes.register.name }" class="text-primary"> Sign up</RouterLink>
            </p>
        </form>
    </section>
</template>
