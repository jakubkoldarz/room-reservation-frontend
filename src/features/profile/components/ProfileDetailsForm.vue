<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref, watch } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { ProfileFormSchema } from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import Container from "@/features/shared/Container.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import type { User } from "@/features/users/types";

const { userInfo } = defineProps<{
    userInfo: User;
}>();

const authStore = useAuthStore();
const toasts = useToastsStore();
const isSaving = ref(false);

const { handleSubmit, errors, defineField, resetForm, setErrors, meta } = useForm({
    validationSchema: toTypedSchema(ProfileFormSchema),
});
const [firstname, firstnameAttrs] = defineField("firstname");
const [lastname, lastnameAttrs] = defineField("lastname");

watch(
    () => userInfo,
    (info) =>
        resetForm({ values: { firstname: info.firstname ?? "", lastname: info.lastname ?? "" } }),
    { immediate: true },
);

const onSubmit = handleSubmit(async (values) => {
    isSaving.value = true;
    const response = await apiCall(() => apiClient.putUsersprofile(values));
    isSaving.value = false;

    if (!response.ok) {
        if (response.error.kind === "validation") {
            setErrors({
                firstname: response.error.fieldErrors.firstname?.[0],
                lastname: response.error.fieldErrors.lastname?.[0],
            });
        }
        toasts.pushError({ title: "Failed to save", message: apiErrorMessage(response.error) });
        return;
    }

    await authStore.init();
    toasts.pushSuccess({ title: "Saved", message: "Your name was updated." });
});
</script>

<template>
    <Container>
        <h2 class="text-lg font-semibold">Personal details</h2>
        <hr class="border-border mt-2 mb-4" />
        <form class="flex flex-col gap-3" novalidate @submit="onSubmit">
            <BaseInput
                v-model="firstname"
                v-bind="firstnameAttrs"
                label="First name"
                autocomplete="given-name"
                :error-message="errors.firstname"
            />
            <BaseInput
                v-model="lastname"
                v-bind="lastnameAttrs"
                label="Last name"
                autocomplete="family-name"
                :error-message="errors.lastname"
            />
            <BaseButton
                type="submit"
                :is-loading="isSaving"
                :disabled="!meta.dirty"
                class="mt-1 self-end"
            >
                Save
            </BaseButton>
        </form>
    </Container>
</template>
