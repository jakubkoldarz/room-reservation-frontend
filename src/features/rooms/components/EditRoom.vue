<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, watch } from "vue";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import type { Building } from "@/features/buildings/types";
import BaseInput from "@/features/shared/BaseInput.vue";
import ComboBox from "@/features/shared/ComboBox.vue";
import Container from "@/features/shared/Container.vue";
import SlidingCheckbox from "@/features/shared/SlidingCheckbox.vue";
import { RoomFormSchema } from "../schemas";
import type { RoomForm } from "../types";

const { buildings, defaultBuildingId } = defineProps<{
    buildings: readonly Building[];
    defaultBuildingId?: string;
}>();

const emit = defineEmits<{
    buildingChange: [buildingId: string];
}>();

const { handleSubmit, errors, defineField, setErrors, setFieldValue } = useForm({
    validationSchema: toTypedSchema(RoomFormSchema),
    initialValues: { requiresApproval: false, buildingId: defaultBuildingId },
});
const [identifier, identifierAttrs] = defineField("identifier");
const [buildingId] = defineField("buildingId");
const [floor, floorAttrs] = defineField("floor");
const [capacity, capacityAttrs] = defineField("capacity");
const [requiresApproval] = defineField("requiresApproval");

const buildingOptions = computed(() =>
    buildings.map((building) => ({ value: building.id, label: building.name })),
);

const selectedBuilding = computed(() =>
    buildings.find((building) => building.id === buildingId.value),
);

watch(
    () => buildingId.value,
    (id) => emit("buildingChange", id ?? ""),
    { immediate: true },
);

watch(
    () => defaultBuildingId,
    (id) => {
        if (id && !buildingId.value) setFieldValue("buildingId", id);
    },
);

const submit = handleSubmit((values): RoomForm => values);

function showServerErrors(fieldErrors: Readonly<Record<string, readonly string[]>>): void {
    setErrors({
        identifier: fieldErrors.identifier?.[0],
        buildingId: fieldErrors.buildingId?.[0],
        floor: fieldErrors.floor?.[0],
        capacity: fieldErrors.capacity?.[0],
        requiresApproval: fieldErrors.requiresApproval?.[0],
    });
}

defineExpose({ submit, showServerErrors });
</script>

<template>
    <Container class="@container flex flex-col gap-2">
        <div>
            <div class="flex items-center gap-2">
                <NumberCircle>1</NumberCircle>
                <h2 class="text-lg font-semibold">Room details</h2>
            </div>
            <p class="text-text-muted text-sm">
                <slot />
            </p>
            <hr class="border-border my-2" />
        </div>

        <div class="grid grid-cols-1 gap-4 @lg:grid-cols-2 @xl:grid-cols-3">
            <BaseInput
                v-bind="identifierAttrs"
                v-model="identifier"
                :error-message="errors.identifier"
                class="bg-text-muted/10 rounded-lg px-4 py-2 text-sm"
                label="Identifier"
                placeholder="e.g. A-101"
                is-required
            />

            <ComboBox
                v-model="buildingId"
                :options="buildingOptions"
                :error-message="errors.buildingId"
                class="bg-text-muted/10 rounded-lg py-2 text-sm"
                label="Building"
                placeholder="Search building..."
                is-required
            />

            <div class="flex flex-col gap-1">
                <BaseInput
                    v-bind="floorAttrs"
                    v-model="floor"
                    :error-message="errors.floor"
                    class="bg-text-muted/10 rounded-lg px-4 py-2 text-sm"
                    label="Floor"
                    placeholder="e.g. 0, 1, 2"
                    type="number"
                    is-required
                />
                <p v-if="selectedBuilding" class="text-text-muted text-xs">
                    {{ selectedBuilding.name }} has {{ selectedBuilding.floorsCount }}
                    {{ selectedBuilding.floorsCount === 1 ? "floor" : "floors" }}.
                </p>
            </div>

            <BaseInput
                v-bind="capacityAttrs"
                v-model="capacity"
                :error-message="errors.capacity"
                class="bg-text-muted/10 rounded-lg px-4 py-2 text-sm"
                label="Capacity"
                placeholder="e.g. 30"
                type="number"
                min="1"
                is-required
            />

            <div class="flex flex-col gap-1 @lg:col-span-2">
                <span class="text-sm font-semibold">Reservations</span>
                <div
                    class="bg-text-muted/10 border-border flex flex-col-reverse items-start gap-2 rounded-lg border px-4 py-2 @md:flex-row @md:items-center @md:justify-between @md:gap-4"
                >
                    <p class="text-text-muted text-sm">
                        {{
                            requiresApproval
                                ? "Each reservation must be approved before it is confirmed."
                                : "Reservations are confirmed immediately."
                        }}
                    </p>
                    <div class="shrink-0">
                        <SlidingCheckbox v-model="requiresApproval" label="Requires approval" />
                    </div>
                </div>
                <p v-if="errors.requiresApproval" class="text-danger text-sm">
                    {{ errors.requiresApproval }}
                </p>
            </div>
        </div>
    </Container>
</template>
