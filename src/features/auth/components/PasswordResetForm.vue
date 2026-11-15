<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import type { ApiError } from "@/api/errors";
import BaseButton from "@/features/shared/BaseButton.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { useResendCooldown } from "../composables/useResendCooldown";
import { MIN_PASSWORD_LENGTH, ResetPasswordFormSchema, VERIFICATION_CODE_LENGTH } from "../schemas";
import { authErrorMessage, verificationCodeErrorMessage } from "../utils/authErrors";
import PasswordInput from "./PasswordInput.vue";
import SegmentedInput from "./SegmentedInput.vue";

const { email } = defineProps<{
    email: string;
}>();

const emit = defineEmits<{
    done: [];
}>();

const toasts = useToastsStore();
const { remaining: cooldown, start: startCooldown } = useResendCooldown(true);

const code = ref("");
const codeError = ref<string>();
const error = ref<string>();
const isSaving = ref(false);
const isResending = ref(false);
const codeInput = ref<InstanceType<typeof SegmentedInput>>();

const { handleSubmit, errors, defineField, setFieldError } = useForm({
    validationSchema: toTypedSchema(ResetPasswordFormSchema),
});
const [password, passwordAttrs] = defineField("password");
const [confirmPassword, confirmPasswordAttrs] = defineField("confirmPassword");

const isCodeInvalid = computed(() => codeError.value !== undefined);
const resendLabel = computed(() => {
    if (cooldown.value > 0) return `Resend in ${cooldown.value}s`;
    return "Resend code";
});

function clearCode(): void {
    code.value = "";
    if (codeInput.value) codeInput.value.focus();
}

function showFailure(failure: ApiError): void {
    if (failure.kind === "validation") {
        setFieldError("password", failure.fieldErrors.newPassword?.[0]);
        codeError.value = failure.fieldErrors.verificationCode?.[0];
        error.value = failure.formErrors[0];
        return;
    }

    const isRejectedCode = failure.kind === "http" && failure.status === 400;
    if (isRejectedCode) {
        codeError.value = verificationCodeErrorMessage(failure);
        clearCode();
        return;
    }

    error.value = authErrorMessage(failure);
}

const onSubmit = handleSubmit(async (values) => {
    error.value = undefined;
    codeError.value = undefined;

    if (code.value.length !== VERIFICATION_CODE_LENGTH) {
        codeError.value = `Enter the ${VERIFICATION_CODE_LENGTH}-digit code from the email.`;
        return;
    }

    isSaving.value = true;
    const response = await apiCall(() =>
        apiClient.postAuthpasswordreset({
            emailAddress: email,
            verificationCode: code.value,
            newPassword: values.password,
        }),
    );
    isSaving.value = false;

    if (!response.ok) {
        showFailure(response.error);
        return;
    }

    toasts.pushSuccess({
        title: "Password changed",
        message: "Sign in with your new password.",
    });
    emit("done");
});

async function resend(): Promise<void> {
    if (cooldown.value > 0 || isResending.value) return;

    isResending.value = true;
    error.value = undefined;
    const response = await apiCall(() => apiClient.postAuthpasswordforgot({ emailAddress: email }));
    isResending.value = false;

    if (!response.ok) {
        error.value = authErrorMessage(response.error);
        return;
    }

    codeError.value = undefined;
    clearCode();
    toasts.pushInfo({ title: "Code sent", message: "Check your inbox for a new code." });
    startCooldown();
}
</script>

<template>
    <form class="flex flex-col gap-4" novalidate @submit="onSubmit">
        <ErrorText :error class="mb-0!" role="alert" />

        <div class="flex flex-col gap-2">
            <SegmentedInput
                ref="codeInput"
                v-model="code"
                :segments="VERIFICATION_CODE_LENGTH"
                :invalid="isCodeInvalid"
                :disabled="isSaving"
                autofocus
            />
            <p v-if="codeError" class="text-danger text-center text-xs" role="alert">
                {{ codeError }}
            </p>
        </div>

        <div class="flex flex-col gap-1">
            <PasswordInput
                v-model="password"
                v-bind="passwordAttrs"
                label="New password"
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
            label="Repeat new password"
            autocomplete="new-password"
            :error-message="errors.confirmPassword"
        />

        <BaseButton type="submit" :is-loading="isSaving" class="mt-2 justify-center py-2">
            Set new password
        </BaseButton>

        <div class="flex flex-wrap items-center justify-center gap-x-1 text-sm">
            <span class="text-text-muted">Didn't get the code?</span>
            <PlainButton
                type="button"
                :is-loading="isResending"
                :disabled="cooldown > 0"
                @click="resend"
            >
                {{ resendLabel }}
            </PlainButton>
        </div>
    </form>
</template>
