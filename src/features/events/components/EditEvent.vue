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
import { DEFAULT_EVENT_PRIORITY, EVENT_PRIORITY_OPTIONS } from "../utils/eventPriority";

const { event = null, readonly = false } = defineProps<{
    event?: EventInfo | null;
    readonly?: boolean;
}>();

const { handleSubmit, errors, defineField, setErrors, values } = useForm({
    validationSchema: toTypedSchema(createEventFormSchema(event?.startDate)),
    initialValues: {
        name: event?.name ?? "",
        startDate: event?.startDate ?? "",
        endDate: event?.endDate ?? "",
        isClosed: event?.isClosed ?? true,
        priority: event?.priority ?? DEFAULT_EVENT_PRIORITY,
        startTime: event?.startTime ? formatHm(event.startTime) : undefined,
        endTime: event?.endTime ? formatHm(event.endTime) : undefined,
    },
});
const [name, nameAttrs] = defineField("name");
const [startDate, startDateAttrs] = defineField("startDate");
const [endDate, endDateAttrs] = defineField("endDate");
const [isClosed] = defineField("isClosed");
const [priority] = defineField("priority");
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

const visibleTypes = computed(() =>
    readonly ? TYPES.filter((type) => type.value === isClosed.value) : TYPES,
);

const visiblePriorities = computed(() =>
    readonly
        ? EVENT_PRIORITY_OPTIONS.filter((option) => option.value === priority.value)
        : EVENT_PRIORITY_OPTIONS,
);

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
            :readonly
            :is-required="!readonly"
            :class="{ 'bg-background cursor-default': readonly }"
            :error-message="errors.name"
        />

        <div class="grid grid-cols-1 gap-4 @md:grid-cols-2">
            <BaseInput
                :model-value="startDate"
                v-bind="startDateAttrs"
                type="date"
                label="From"
                :readonly
                :is-required="!readonly"
                :class="{ 'bg-background cursor-default': readonly }"
                :min="earliestStart"
                :error-message="errors.startDate"
                @update:model-value="onStartDate"
            />
            <BaseInput
                v-model="endDate"
                v-bind="endDateAttrs"
                type="date"
                label="To"
                :readonly
                :is-required="!readonly"
                :class="{ 'bg-background cursor-default': readonly }"
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
            :aria-readonly="readonly"
            class="grid grid-cols-1 gap-2 @md:grid-cols-2"
        >
            <button
                v-for="type in visibleTypes"
                :key="type.title"
                type="button"
                role="radio"
                :aria-checked="isClosed === type.value"
                :disabled="readonly"
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

        <div class="flex flex-col gap-2">
            <span class="text-sm font-semibold">Priority</span>
            <div
                role="radiogroup"
                aria-label="Event priority"
                :aria-readonly="readonly"
                class="grid grid-cols-1 gap-2 @md:grid-cols-3"
            >
                <button
                    v-for="option in visiblePriorities"
                    :key="option.value"
                    type="button"
                    role="radio"
                    :aria-checked="priority === option.value"
                    :disabled="readonly"
                    class="focus-visible:ring-primary flex flex-col gap-0.5 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2"
                    :class="
                        priority === option.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/40'
                    "
                    @click="priority = option.value"
                >
                    <span
                        class="text-sm font-semibold"
                        :class="priority === option.value ? 'text-primary' : 'text-text'"
                    >
                        {{ option.title }}
                    </span>
                    <span class="text-text-muted text-xs">{{ option.description }}</span>
                </button>
            </div>
            <p v-if="!readonly" class="text-text-muted text-xs">
                When events of different priorities cover the same day, the room follows the highest
                one. Events with the same priority can't overlap.
            </p>
        </div>

        <div v-if="!isClosed" class="grid grid-cols-2 gap-4">
            <BaseInput
                v-model="startTime"
                v-bind="startTimeAttrs"
                type="time"
                label="Open from"
                step="900"
                :readonly
                :is-required="!readonly"
                :class="{ 'bg-background cursor-default': readonly }"
                :error-message="errors.startTime"
            />
            <BaseInput
                v-model="endTime"
                v-bind="endTimeAttrs"
                type="time"
                label="Open until"
                step="900"
                :readonly
                :is-required="!readonly"
                :class="{ 'bg-background cursor-default': readonly }"
                :error-message="errors.endTime"
            />
        </div>
    </Container>
</template>
