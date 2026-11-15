<script setup lang="ts">
import { EnvelopeIcon } from "@heroicons/vue/24/solid";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { ref } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import { ForgotPasswordFormSchema } from "../schemas";
import { authErrorMessage } from "../utils/authErrors";

const emit = defineEmits<{
    sent: [email: string];
}>();

const isSending = ref(false);
const error = ref<string>();

const { handleSubmit, errors, defineField, setFieldError } = useForm({
    validationSchema: toTypedSchema(ForgotPasswordFormSchema),
});
const [email, emailAttrs] = defineField("email");

const onSubmit = handleSubmit(async (values) => {
    isSending.value = true;
    error.value = undefined;
    const response = await apiCall(() =>
        apiClient.postAuthpasswordforgot({ emailAddress: values.email }),
    );
    isSending.value = false;

    if (response.ok) {
        emit("sent", values.email);
        return;
    }

    if (response.error.kind === "validation") {
        setFieldError("email", response.error.fieldErrors.emailAddress?.[0]);
    } else {
        error.value = authErrorMessage(response.error);
    }
});
</script>

<template>
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
        <BaseButton type="submit" :is-loading="isSending" class="mt-2 justify-center py-2">
            Send code
        </BaseButton>
    </form>
</template>
