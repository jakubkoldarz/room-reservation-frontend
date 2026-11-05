<script setup lang="ts">
import { EnvelopeIcon } from "@heroicons/vue/24/solid";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import SegmentedInput from "@/features/auth/components/SegmentedInput.vue";
import { useResendCooldown } from "@/features/auth/composables/useResendCooldown";
import { VERIFICATION_CODE_LENGTH } from "@/features/auth/schemas";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import {
    authErrorMessage,
    isEmailTaken,
    verificationCodeErrorMessage,
} from "@/features/auth/utils/authErrors";
import Badge from "@/features/shared/Badge.vue";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import Container from "@/features/shared/Container.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { ChangeEmailFormSchema } from "../schemas";

const { email, pendingEmail = null } = defineProps<{
    email: string;
    pendingEmail?: string | null;
}>();

const authStore = useAuthStore();
const toasts = useToastsStore();
const cooldown = useResendCooldown();

const step = ref<"idle" | "editing" | "confirming">("idle");
const targetEmail = ref("");
const verificationId = ref<string | null>(null);
const isSending = ref(false);

const code = ref("");
const codeError = ref<string>();
const isConfirming = ref(false);
const codeInput = ref<InstanceType<typeof SegmentedInput>>();
const isCodeComplete = computed(() => code.value.length === VERIFICATION_CODE_LENGTH);

const { handleSubmit, errors, defineField, resetForm, setFieldError } = useForm({
    validationSchema: toTypedSchema(ChangeEmailFormSchema),
});
const [newEmail, newEmailAttrs] = defineField("email");

function startEditing(): void {
    resetForm({ values: { email: "" } });
    step.value = "editing";
}

function cancel(): void {
    step.value = "idle";
    verificationId.value = null;
    code.value = "";
    codeError.value = undefined;
    cooldown.reset();
}

async function sendCode(address: string): Promise<boolean> {
    isSending.value = true;
    const response = await apiCall(() => apiClient.patchAuthemail({ emailAddress: address }));
    isSending.value = false;

    if (!response.ok) {
        if (isEmailTaken(response.error) && step.value === "editing") {
            setFieldError("email", "This email is already used by another account");
        } else if (isEmailTaken(response.error)) {
            toasts.pushError({
                title: "Failed to send code",
                message: "This email is already used by another account.",
            });
        } else if (response.error.kind === "validation") {
            setFieldError("email", response.error.fieldErrors.emailAddress?.[0]);
        } else {
            toasts.pushError({
                title: "Failed to send code",
                message: authErrorMessage(response.error),
            });
        }
        return false;
    }

    targetEmail.value = address;
    verificationId.value = response.data.verificationId;
    code.value = "";
    codeError.value = undefined;
    step.value = "confirming";
    cooldown.start();
    return true;
}

const submitNewEmail = handleSubmit(async (values) => {
    if (values.email.toLowerCase() === email.toLowerCase()) {
        setFieldError("email", "This is already your email");
        return;
    }
    await sendCode(values.email);
});

async function resend(): Promise<void> {
    if (cooldown.remaining.value > 0 || isSending.value) return;
    const sent = await sendCode(targetEmail.value);
    if (sent) {
        toasts.pushInfo({
            title: "Code sent",
            message: `Check the inbox of ${targetEmail.value}.`,
        });
        codeInput.value?.focus();
    }
}

async function resumePending(): Promise<void> {
    if (pendingEmail) await sendCode(pendingEmail);
}

async function confirm(): Promise<void> {
    if (!verificationId.value || !isCodeComplete.value || isConfirming.value) return;

    isConfirming.value = true;
    codeError.value = undefined;
    const response = await apiCall(() =>
        apiClient.postAuthemailverify({
            verificationId: verificationId.value!,
            verificationCode: code.value,
        }),
    );
    isConfirming.value = false;

    if (!response.ok) {
        codeError.value = verificationCodeErrorMessage(response.error);
        code.value = "";
        codeInput.value?.focus();
        return;
    }

    cancel();
    await authStore.init();
    toasts.pushSuccess({
        title: "Email changed",
        message: `Your email is now ${targetEmail.value}.`,
    });
}
</script>

<template>
    <Container>
        <h2 class="text-lg font-semibold">Email</h2>
        <hr class="border-border mt-2 mb-4" />

        <div v-if="step === 'idle'" class="flex flex-col gap-3">
            <div class="flex items-center gap-2">
                <EnvelopeIcon class="text-text-muted/70 size-4 shrink-0" />
                <span class="min-w-0 text-sm font-medium break-all">{{ email }}</span>
                <Badge type="success" class="shrink-0 px-2!">Verified</Badge>
            </div>
            <p v-if="pendingEmail" class="text-text-muted text-xs">
                Change to <span class="font-medium">{{ pendingEmail }}</span> was not confirmed.
                <PlainButton
                    type="button"
                    class="inline-flex! text-xs"
                    :is-loading="isSending"
                    @click="resumePending"
                >
                    Send code again
                </PlainButton>
            </p>
            <OutlineButton type="button" class="self-end" @click="startEditing">
                Change email
            </OutlineButton>
        </div>

        <form
            v-else-if="step === 'editing'"
            class="flex flex-col gap-3"
            novalidate
            @submit="submitNewEmail"
        >
            <BaseInput
                v-model="newEmail"
                v-bind="newEmailAttrs"
                type="email"
                label="New email"
                autocomplete="email"
                :error-message="errors.email"
            />
            <p class="text-text-muted text-xs">
                We will send a code to the new address. Your current email stays until you confirm.
            </p>
            <div class="flex justify-end gap-2">
                <OutlineButton type="button" @click="cancel">Cancel</OutlineButton>
                <BaseButton type="submit" :is-loading="isSending">Send code</BaseButton>
            </div>
        </form>

        <form v-else class="flex flex-col gap-3" novalidate @submit.prevent="confirm">
            <p class="text-text-muted text-sm">
                We sent a {{ VERIFICATION_CODE_LENGTH }}-digit code to
                <span class="font-medium">{{ targetEmail }}</span
                >. It is valid for 10 minutes.
            </p>
            <ErrorText :error="codeError" class="mb-0!" role="alert" />
            <SegmentedInput
                ref="codeInput"
                v-model="code"
                :segments="VERIFICATION_CODE_LENGTH"
                :invalid="!!codeError"
                :disabled="isConfirming"
                autofocus
                @complete="confirm"
            />
            <div class="flex justify-end gap-2">
                <OutlineButton type="button" @click="cancel">Cancel</OutlineButton>
                <BaseButton type="submit" :is-loading="isConfirming" :disabled="!isCodeComplete">
                    Confirm
                </BaseButton>
            </div>
            <div class="flex flex-wrap items-center justify-center gap-x-1 text-sm">
                <span class="text-text-muted">Didn't get the code?</span>
                <PlainButton
                    type="button"
                    :is-loading="isSending"
                    :disabled="cooldown.remaining.value > 0"
                    @click="resend"
                >
                    {{
                        cooldown.remaining.value > 0
                            ? `Resend in ${cooldown.remaining.value}s`
                            : "Resend code"
                    }}
                </PlainButton>
            </div>
        </form>
    </Container>
</template>
