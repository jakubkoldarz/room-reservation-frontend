<script setup lang="ts">
import Container from "@/features/shared/Container.vue";
import NumberCircle from "./NumberCircle.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import { useClipboard } from "@vueuse/core";
import { useForm } from "vee-validate";
import { schemas } from "@/api/generated.ts";
import { toTypedSchema } from "@vee-validate/zod";
import { watch } from "vue";
import type { BuildingInfo } from "@/types/dtos.ts";
import { ref } from "vue";

const idLabel = ref<string>("System Identifier (id / UUID)");
let timeoutId = null as number | null;

const { building } = defineProps<{
    building?: BuildingInfo;
    isLoading?: boolean;
}>();

const { copy, isSupported } = useClipboard();
function copyBuildingId() {
    if (!isSupported.value || !building?.id) return;
    copy(building.id);
    idLabel.value = "Text Copied!";
    if (timeoutId) clearTimeout(timeoutId);

    timeoutId = window.setTimeout(() => {
        idLabel.value = "System Identifier (id / UUID)";
    }, 2000);
}

const { handleSubmit, errors, defineField, resetForm } = useForm({
    validationSchema: toTypedSchema(schemas.BuildingRequestDto.omit({ availabilities: true })),
});

const submit = handleSubmit((values) => {
    return values;
});

defineExpose({
    submit,
});

watch(
    () => building,
    () => {
        resetForm({
            values: {
                name: building?.name,
                identifier: building?.identifier,
                street: building?.street,
                city: building?.city,
                postalCode: building?.postalCode,
                floorsCount: building?.floorsCount,
            },
        });
    },
);

const [name, nameAttrs] = defineField("name");
const [identifier, identifierAttrs] = defineField("identifier");
const [street, streetAttrs] = defineField("street");
const [city, cityAttrs] = defineField("city");
const [postalCode, postalCodeAttrs] = defineField("postalCode");
const [floorsCount, floorsCountAttrs] = defineField("floorsCount");
</script>

<template>
    <Container class="@container flex flex-col gap-2">
        <div class="flex gap-2 items-center">
            <NumberCircle>1</NumberCircle>
            <h2 class="text-lg font-semibold">Building details</h2>
        </div>
        <p class="text-text-muted text-sm">Edit details of the building. Please fill in all required fields.</p>
        <hr class="border-border my-2" />

        <div class="grid grid-cols-1 @lg:grid-cols-2 @xl:grid-cols-3 gap-4">
            <BaseInput
                @focus="copyBuildingId"
                class="bg-text-muted/10 text-text/60 font-mono cursor-pointer text-sm rounded-lg py-2 px-4"
                readonly
                :label="idLabel"
                :model-value="building?.id"
            />

            <BaseInput
                v-bind="nameAttrs"
                v-model="name"
                :error-message="errors.name"
                class="bg-text-muted/10 cursor-pointer text-sm rounded-lg py-2 px-4"
                label="Building Name"
                placeholder="e.g. Main Building"
                is-required
            />

            <BaseInput
                v-bind="identifierAttrs"
                v-model="identifier"
                :error-message="errors.identifier"
                class="bg-text-muted/10 cursor-pointer text-sm rounded-lg py-2 px-4"
                label="Identifier"
                placeholder="e.g. building-1"
            />

            <BaseInput
                v-bind="cityAttrs"
                v-model="city"
                :error-message="errors.city"
                class="bg-text-muted/10 cursor-pointer text-sm rounded-lg py-2 px-4"
                label="City"
                placeholder="e.g. Warsaw"
                is-required
            />

            <BaseInput
                v-bind="streetAttrs"
                v-model="street"
                :error-message="errors.street"
                class="bg-text-muted/10 cursor-pointer text-sm rounded-lg py-2 px-4"
                label="Street"
                placeholder="e.g. Main Street 1"
                is-required
            />

            <BaseInput
                v-bind="postalCodeAttrs"
                v-model="postalCode"
                :error-message="errors.postalCode"
                class="bg-text-muted/10 cursor-pointer text-sm rounded-lg py-2 px-4"
                label="Postal Code"
                placeholder="XX-XXX"
                is-required
            />

            <BaseInput
                v-bind="floorsCountAttrs"
                v-model="floorsCount"
                :error-message="errors.floorsCount"
                class="bg-text-muted/10 cursor-pointer text-sm rounded-lg py-2 px-4"
                label="Floors Count"
                placeholder="e.g. 1, 2, 3"
                is-required
            />
        </div>
    </Container>
</template>
