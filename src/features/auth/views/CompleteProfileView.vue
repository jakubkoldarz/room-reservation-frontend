<script setup lang="ts">
import { UserIcon } from "@heroicons/vue/24/solid";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import { useRouter } from "vue-router";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import AuthLayout from "../components/AuthLayout.vue";
import { useSignOut } from "../composables/useSignOut";
import { ProfileFormSchema } from "../schemas";
import { useAuthStore } from "../stores/useAuthStore";
import { authErrorMessage } from "../utils/authErrors";

const router = useRouter();
const authStore = useAuthStore();
const toasts = useToastsStore();
const { signOut, isSigningOut } = useSignOut();

const isSaving = ref(false);
const error = ref<string>();

const { handleSubmit, errors, defineField, setErrors } = useForm({
    validationSchema: toTypedSchema(ProfileFormSchema),
    initialValues: {
        firstname: authStore.user?.userInfo.firstname ?? "",
        lastname: authStore.user?.userInfo.lastname ?? "",
    },
});
const [firstname, firstnameAttrs] = defineField("firstname");
const [lastname, lastnameAttrs] = defineField("lastname");

const onSubmit = handleSubmit(async (values) => {
    isSaving.value = true;
    error.value = undefined;

    const response = await apiCall(() => apiClient.putUsersprofile(values));
    if (!response.ok) {
        isSaving.value = false;
        if (response.error.kind === "validation") {
            setErrors({
                firstname: response.error.fieldErrors.firstname?.[0],
                lastname: response.error.fieldErrors.lastname?.[0],
            });
        }
        error.value = authErrorMessage(response.error);
        return;
    }

    await authStore.init();
    toasts.pushSuccess({
        title: "Profile completed",
        message: `Welcome, ${response.data.firstname ?? values.firstname}!`,
    });
    await router.push({ name: "index" });
});
</script>

<template>
    <AuthLayout
        title="Complete your profile"
        description="Tell us your name so others know who booked a room."
        :step="2"
        :total-steps="2"
    >
        <form class="flex flex-col gap-4" novalidate @submit="onSubmit">
            <ErrorText :error class="mb-0!" role="alert" />
            <BaseInput
                v-model="firstname"
                v-bind="firstnameAttrs"
                label="First name"
                autocomplete="given-name"
                :error-message="errors.firstname"
                floating-label
                has-icon
            >
                <template #icon>
                    <UserIcon />
                </template>
            </BaseInput>
            <BaseInput
                v-model="lastname"
                v-bind="lastnameAttrs"
                label="Last name"
                autocomplete="family-name"
                :error-message="errors.lastname"
                floating-label
                has-icon
            >
                <template #icon>
                    <UserIcon />
                </template>
            </BaseInput>
            <BaseButton type="submit" :is-loading="isSaving" class="mt-2 justify-center py-2">
                Continue
            </BaseButton>
        </form>

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
