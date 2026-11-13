<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import Container from "@/features/shared/Container.vue";
import SlidingCheckbox from "@/features/shared/SlidingCheckbox.vue";
import { RoleFormSchema } from "../schemas";
import type { Role, RoleForm } from "../types";

const { role = null, readonly = false } = defineProps<{
    role?: Role | null;
    readonly?: boolean;
}>();

const { handleSubmit, errors, defineField, resetForm, setErrors, setFieldError } = useForm({
    validationSchema: toTypedSchema(RoleFormSchema),
});
const [name, nameAttrs] = defineField("name");
const [isDefault] = defineField("isDefault");
const [isSuperAdmin] = defineField("isSuperAdmin");

watch(
    () => role,
    (next) => {
        if (next) {
            resetForm({
                values: {
                    name: next.name,
                    isDefault: next.isDefault,
                    isSuperAdmin: next.isSuperAdmin,
                },
            });
        } else {
            resetForm({ values: { name: "", isDefault: false, isSuperAdmin: false } });
        }
    },
    { immediate: true },
);

const isCurrentDefault = computed(() => role !== null && role.isDefault);
const isDefaultLocked = computed(() => readonly || isCurrentDefault.value);
const defaultHint = computed(() => {
    if (isCurrentDefault.value) {
        return "Every new account gets this role. To change it, mark another role as the default.";
    }
    return "Every new account gets this role. Only one role can be the default.";
});

const submit = handleSubmit((values): RoleForm => values);

function showServerErrors(fieldErrors: Readonly<Record<string, readonly string[]>>): void {
    setErrors({ name: fieldErrors.name?.[0] });
}

function showNameError(message: string): void {
    setFieldError("name", message);
}

defineExpose({ submit, showServerErrors, showNameError });
</script>

<template>
    <Container class="@container flex flex-col gap-4">
        <div>
            <div class="flex items-center gap-2">
                <NumberCircle>1</NumberCircle>
                <h2 class="text-lg font-semibold">Role details</h2>
            </div>
            <p class="text-text-muted text-sm">
                <slot />
            </p>
            <hr class="border-border my-2" />
        </div>

        <BaseInput
            v-bind="nameAttrs"
            v-model="name"
            :error-message="errors.name"
            :readonly
            class="bg-text-muted/10 rounded-lg px-4 py-2 text-sm"
            label="Name"
            placeholder="e.g. Receptionist"
            is-required
        />

        <div class="grid grid-cols-1 gap-3 @2xl:grid-cols-2">
            <div
                class="border-border flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
            >
                <div class="flex min-w-0 flex-col">
                    <span class="text-sm font-semibold">Default role</span>
                    <span class="text-text-muted text-xs">{{ defaultHint }}</span>
                </div>
                <SlidingCheckbox
                    v-model="isDefault"
                    :disabled="isDefaultLocked"
                    aria-label="Default role"
                />
            </div>
            <div
                class="border-border flex items-center justify-between gap-4 rounded-lg border px-4 py-3"
            >
                <div class="flex min-w-0 flex-col">
                    <span class="text-sm font-semibold">Super admin</span>
                    <span class="text-text-muted text-xs">
                        Can do everything, no matter which permissions are selected below.
                    </span>
                </div>
                <SlidingCheckbox
                    v-model="isSuperAdmin"
                    :disabled="readonly"
                    aria-label="Super admin"
                />
            </div>
        </div>
    </Container>
</template>
