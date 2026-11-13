<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, ref, useId, useTemplateRef, watch } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import type { Availability } from "@/features/availabilities/types";
import { formatHm, slotsForDate } from "@/features/availabilities/utils/schedule";
import type { EventInfo } from "@/features/events/types";
import { parseIsoDate } from "@/features/rooms/utils/calendar";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { toIsoDate } from "@/utils/isoDate";
import { PURPOSE_MAX_LENGTH, ReservationFormSchema } from "../schemas";
import type { Reservation, ReservationDraft, ReservationRoom } from "../types";

const { open, roomId, room, requiresApproval, draft, availabilities, events } = defineProps<{
    open: boolean;
    roomId: string;
    room: ReservationRoom;
    requiresApproval: boolean;
    draft: ReservationDraft | null;
    availabilities: readonly Availability[];
    events: readonly EventInfo[];
}>();

const emit = defineEmits<{
    close: [];
    created: [reservation: Reservation];
    conflict: [];
}>();

const dialog = useTemplateRef("dialog");
const titleId = useId();
const purposeId = useId();
const toasts = useToastsStore();

const isSaving = ref(false);
const formError = ref<string>();

const { handleSubmit, errors, defineField, resetForm, setErrors, setFieldError } = useForm({
    validationSchema: toTypedSchema(ReservationFormSchema),
});
const [date, dateAttrs] = defineField("date");
const [startTime, startTimeAttrs] = defineField("startTime");
const [endTime, endTimeAttrs] = defineField("endTime");
const [purpose, purposeAttrs] = defineField("purpose");

watch(
    () => open,
    (isOpen) => {
        const element = dialog.value;

        if (isOpen) {
            formError.value = undefined;
            resetForm({ values: { ...draft, purpose: "" } });
            if (element && !element.open) element.showModal();
        } else if (element && element.open) {
            element.close();
        }
    },
);

const today = computed(() => toIsoDate(new Date()));

const openingHours = computed(() => {
    const day = parseIsoDate(date.value);
    if (!day) return null;
    const slots = slotsForDate(availabilities, day, events);
    if (slots.length === 0) return "The room is closed on this day.";
    const ranges = slots.map((slot) => `${formatHm(slot.startTime)}–${formatHm(slot.endTime)}`);
    return `Open on this day: ${ranges.join(", ")}`;
});

function isInPast(values: { date: string; startTime: string }): boolean {
    const day = parseIsoDate(values.date);
    if (!day) return false;
    const [hours, minutes] = values.startTime.split(":").map(Number);
    day.setHours(hours, minutes);
    return day.getTime() < Date.now();
}

const submit = handleSubmit(async (values) => {
    formError.value = undefined;
    if (isInPast(values)) {
        setFieldError("startTime", "This time has already passed");
        return;
    }

    isSaving.value = true;
    const response = await apiCall(() =>
        apiClient.postReservations({
            roomId,
            date: values.date,
            startTime: `${values.startTime}:00`,
            endTime: `${values.endTime}:00`,
            purpose: values.purpose || null,
        }),
    );
    isSaving.value = false;

    if (!response.ok) {
        const error = response.error;
        if (error.kind === "validation") {
            setErrors({
                date: error.fieldErrors.date?.[0],
                startTime: error.fieldErrors.startTime?.[0],
                endTime: error.fieldErrors.endTime?.[0],
                purpose: error.fieldErrors.purpose?.[0],
            });
            formError.value = error.formErrors[0];
        } else if (error.kind === "http" && error.status === 409) {
            formError.value = "This time overlaps another reservation. The calendar was refreshed.";
            emit("conflict");
        } else {
            formError.value = apiErrorMessage(error);
        }
        return;
    }

    toasts.pushSuccess({
        title: "Reservation created",
        message: requiresApproval ? "It is waiting for approval." : "The room is booked for you.",
    });
    emit("created", response.data);
});
</script>

<template>
    <dialog
        ref="dialog"
        :aria-labelledby="titleId"
        class="bg-surface text-text border-border mx-0 mt-auto mb-0 w-full max-w-none rounded-t-xl border p-0 shadow-lg backdrop:bg-black/30 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md sm:rounded-xl"
        @close="emit('close')"
        @click.self="emit('close')"
    >
        <form class="flex flex-col gap-4 p-4 sm:p-6" novalidate @submit="submit">
            <div class="flex flex-col gap-1">
                <h2 :id="titleId" class="text-lg font-semibold">New reservation</h2>
                <p class="text-sm font-medium">{{ room.name }}</p>
                <p class="text-text-muted text-sm">{{ room.building }}</p>
            </div>

            <ErrorText :error="formError" class="mb-0! text-left" role="alert" />

            <BaseInput
                v-model="date"
                v-bind="dateAttrs"
                type="date"
                label="Date"
                :min="today"
                :error-message="errors.date"
            />
            <div class="grid grid-cols-2 gap-3">
                <BaseInput
                    v-model="startTime"
                    v-bind="startTimeAttrs"
                    type="time"
                    label="From"
                    step="900"
                    :error-message="errors.startTime"
                />
                <BaseInput
                    v-model="endTime"
                    v-bind="endTimeAttrs"
                    type="time"
                    label="To"
                    step="900"
                    :error-message="errors.endTime"
                />
            </div>
            <p v-if="openingHours" class="text-text-muted -mt-2 text-xs">{{ openingHours }}</p>

            <div class="flex flex-col gap-1">
                <label :for="purposeId" class="text-sm font-semibold">Purpose (optional)</label>
                <textarea
                    :id="purposeId"
                    v-model="purpose"
                    v-bind="purposeAttrs"
                    rows="3"
                    :maxlength="PURPOSE_MAX_LENGTH"
                    class="text-text focus-visible:ring-primary w-full resize-none rounded border px-2 py-1 text-sm outline-none focus-visible:ring-2"
                    :class="errors.purpose ? 'border-danger' : 'border-border'"
                ></textarea>
                <div class="flex justify-between gap-2 text-xs">
                    <span class="text-danger">{{ errors.purpose }}</span>
                    <span class="text-text-muted tabular-nums">
                        {{ purpose?.length ?? 0 }}/{{ PURPOSE_MAX_LENGTH }}
                    </span>
                </div>
            </div>

            <p
                v-if="requiresApproval"
                class="bg-warning/10 border-warning text-warning-text rounded border-l-4 px-3 py-2 text-xs"
            >
                This room requires approval. Your reservation will wait until it is confirmed.
            </p>

            <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <OutlineButton
                    type="button"
                    class="justify-center py-2 sm:py-1"
                    @click="emit('close')"
                >
                    Cancel
                </OutlineButton>
                <BaseButton
                    type="submit"
                    :is-loading="isSaving"
                    class="justify-center py-2 sm:py-1"
                >
                    Reserve
                </BaseButton>
            </div>
        </form>
    </dialog>
</template>
