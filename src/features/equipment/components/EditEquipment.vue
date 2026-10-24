<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useClipboard } from "@vueuse/core";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import Container from "@/features/shared/Container.vue";
import { EquipmentFormSchema, type EquipmentForm } from "../schemas";
import type { Equipment } from "../types";
import IconPicker from "./IconPicker.vue";

const { equipment = null, isNew = false } = defineProps<{
    /** Edytowany sprzęt; przy dodawaniu brak. */
    equipment?: Equipment | null;
    isNew?: boolean;
}>();

const { handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
    validationSchema: toTypedSchema(EquipmentFormSchema),
});
const [name, nameAttrs] = defineField("name");
const [icon] = defineField("icon");

watch(
    () => equipment,
    (next) => resetForm({ values: { name: next?.name ?? "", icon: next?.icon ?? "" } }),
    { immediate: true },
);

const submit = handleSubmit((values): EquipmentForm => values);

function showServerErrors(fieldErrors: Readonly<Record<string, readonly string[]>>): void {
    setErrors({ name: fieldErrors.name?.[0], icon: fieldErrors.icon?.[0] });
}

defineExpose({ submit, showServerErrors });

const { copy, copied, isSupported } = useClipboard({ copiedDuring: 2000 });
const idLabel = computed(() => (copied.value ? "Copied!" : "System Identifier (id / UUID)"));
function copyId(): void {
    if (isSupported.value && equipment) void copy(equipment.id);
}
</script>

<template>
    <Container class="@container flex flex-col gap-4">
        <div>
            <div class="flex items-center gap-2">
                <NumberCircle>1</NumberCircle>
                <h2 class="text-lg font-semibold">Equipment details</h2>
            </div>
            <p class="text-text-muted text-sm">
                <slot />
            </p>
            <hr class="border-border my-2" />
        </div>

        <div class="grid grid-cols-1 gap-4 @lg:grid-cols-2">
            <BaseInput
                v-if="!isNew"
                class="bg-text-muted/10 text-text/60 cursor-pointer rounded-lg px-4 py-2 font-mono text-sm"
                readonly
                :label="idLabel"
                :model-value="equipment?.id"
                @focus="copyId"
            />

            <BaseInput
                v-bind="nameAttrs"
                v-model="name"
                :error-message="errors.name"
                class="bg-text-muted/10 rounded-lg px-4 py-2 text-sm"
                label="Name"
                placeholder="e.g. Projector"
                is-required
            />
        </div>

        <IconPicker v-model="icon" :error="errors.icon" />
    </Container>
</template>
