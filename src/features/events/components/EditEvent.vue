<script setup lang="ts">
import { ClockIcon, LockClosedIcon } from "@heroicons/vue/24/outline";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed } from "vue";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import Container from "@/features/shared/Container.vue";
import { formatHm } from "@/features/availabilities/utils/schedule";
import { toIsoDate } from "@/utils/isoDate";
import { createEventFormSchema } from "../schemas";
import type { EventForm, EventInfo } from "../types";
import { eventDayCount } from "../utils/eventFormat";

const { event = null } = defineProps<{
    event?: EventInfo | null;
}>();

const { handleSubmit, errors, defineField, setErrors, values } = useForm({
    validationSchema: toTypedSchema(createEventFormSchema(event?.startDate)),
    initialValues: {
        name: event?.name ?? "",
        startDate: event?.startDate ?? "",
        endDate: event?.endDate ?? "",
        isClosed: event?.isClosed ?? true,
        startTime: event?.startTime ? formatHm(event.startTime) : undefined,
        endTime: event?.endTime ? formatHm(event.endTime) : undefined,
    },
});
const [name, nameAttrs] = defineField("name");
const [startDate, startDateAttrs] = defineField("startDate");
const [endDate, endDateAttrs] = defineField("endDate");
const [isClosed] = defineField("isClosed");
const [startTime, startTimeAttrs] = defineField("startTime");
const [endTime, endTimeAttrs] = defineField("endTime");

const today = toIsoDate(new Date());
const earliestStart = event && event.startDate < today ? event.startDate : today;

const TYPES = [
    {
        value: true,
        icon: LockClosedIcon,
        title: "Room closed",
        description: "Nobody can book the rooms on these days.",
    },
    {
        value: false,
        icon: ClockIcon,
        title: "Special hours",
        description:
            "The rooms are open only in the hours below, even on days they are normally closed.",
    },
] as const;

const dayCount = computed(() => {
    if (!values.startDate || !values.endDate || values.endDate < values.startDate) return null;
    return eventDayCount({ startDate: values.startDate, endDate: values.endDate });
});

function onStartDate(value: string | number | null | undefined): void {
    startDate.value = String(value ?? "");
    if (startDate.value && (!endDate.value || endDate.value < startDate.value)) {
        endDate.value = startDate.value;
    }
}

const submit = handleSubmit((formValues): EventForm => formValues);

function showServerErrors(fieldErrors: Readonly<Record<string, readonly string[]>>): void {
    setErrors({
        name: fieldErrors.name?.[0],
        startDate: fieldErrors.startDate?.[0],
        endDate: fieldErrors.endDate?.[0],
        startTime: fieldErrors.startTime?.[0],
        endTime: fieldErrors.endTime?.[0],
    });
}

defineExpose({ submit, showServerErrors });
</script>

<template>
    <Container class="@container flex flex-col gap-4">
        <div>
            <div class="flex items-center gap-2">
                <NumberCircle>1</NumberCircle>
                <h2 class="text-lg font-semibold">Event details</h2>
            </div>
            <p class="text-text-muted text-sm">
                An event replaces the normal opening hours of the selected rooms on its days.
            </p>
            <hr class="border-border mt-2" />
        </div>

        <BaseInput
            v-model="name"
            v-bind="nameAttrs"
            label="Name"
            is-required
            :error-message="errors.name"
        />

        <div class="grid grid-cols-1 gap-4 @md:grid-cols-2">
            <BaseInput
                :model-value="startDate"
                v-bind="startDateAttrs"
                type="date"
                label="From"
                is-required
                :min="earliestStart"
                :error-message="errors.startDate"
                @update:model-value="onStartDate"
            />
            <BaseInput
                v-model="endDate"
                v-bind="endDateAttrs"
                type="date"
                label="To"
                is-required
                :min="startDate || today"
                :error-message="errors.endDate"
            />
        </div>
        <p v-if="dayCount" class="text-text-muted -mt-2 text-xs">
            {{ dayCount === 1 ? "1 day" : `${dayCount} days` }}, both dates included.
        </p>

        <div
            role="radiogroup"
            aria-label="Event type"
            class="grid grid-cols-1 gap-2 @md:grid-cols-2"
        >
            <button
                v-for="type in TYPES"
                :key="type.title"
                type="button"
                role="radio"
                :aria-checked="isClosed === type.value"
                class="focus-visible:ring-primary flex items-start gap-3 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2"
                :class="
                    isClosed === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40'
                "
                @click="isClosed = type.value"
            >
                <component
                    :is="type.icon"
                    class="mt-0.5 size-5 shrink-0"
                    :class="isClosed === type.value ? 'text-primary' : 'text-text-muted'"
                />
                <span class="flex flex-col gap-0.5">
                    <span
                        class="text-sm font-semibold"
                        :class="isClosed === type.value ? 'text-primary' : 'text-text'"
                    >
                        {{ type.title }}
                    </span>
                    <span class="text-text-muted text-xs">{{ type.description }}</span>
                </span>
            </button>
        </div>

        <div v-if="!isClosed" class="grid grid-cols-2 gap-4">
            <BaseInput
                v-model="startTime"
                v-bind="startTimeAttrs"
                type="time"
                label="Open from"
                step="900"
                is-required
                :error-message="errors.startTime"
            />
            <BaseInput
                v-model="endTime"
                v-bind="endTimeAttrs"
                type="time"
                label="Open until"
                step="900"
                is-required
                :error-message="errors.endTime"
            />
        </div>
    </Container>
</template>
