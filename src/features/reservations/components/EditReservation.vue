<script setup lang="ts">
import { BuildingOfficeIcon, CalendarDaysIcon, RectangleStackIcon } from "@heroicons/vue/24/solid";
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, useId, watch } from "vue";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import { formatHm } from "@/features/availabilities/utils/schedule";
import { useRoomDestination } from "@/features/rooms/composables/useRoomDestination";
import { formatFloor } from "@/features/rooms/utils/formatRoom";
import BaseInput from "@/features/shared/BaseInput.vue";
import Container from "@/features/shared/Container.vue";
import TextLink from "@/features/shared/TextLink.vue";
import { PURPOSE_MAX_LENGTH, ReservationEditFormSchema } from "../schemas";
import type { ReservationListItem, ReservationState, ReservationTimeRange } from "../types";
import { formatReservationDate } from "../utils/reservationDetails";
import { isSameTimeRange } from "../utils/reservationEdit";
import ReservationStatusChip from "./ReservationStatusChip.vue";

const {
    item,
    state,
    readonly = false,
} = defineProps<{
    item: ReservationListItem;
    state: ReservationState;
    readonly?: boolean;
}>();

const emit = defineEmits<{
    change: [range: ReservationTimeRange];
}>();

const purposeId = useId();
const { roomLink } = useRoomDestination();

const reservation = item.reservationInfo;
const original = { startTime: reservation.startTime, endTime: reservation.endTime };

const { handleSubmit, errors, defineField, setErrors, values } = useForm({
    validationSchema: toTypedSchema(ReservationEditFormSchema),
    initialValues: {
        startTime: formatHm(reservation.startTime),
        endTime: formatHm(reservation.endTime),
        purpose: reservation.purpose ?? "",
    },
});
const [startTime, startTimeAttrs] = defineField("startTime");
const [endTime, endTimeAttrs] = defineField("endTime");
const [purpose, purposeAttrs] = defineField("purpose");

watch(
    () => [values.startTime, values.endTime] as const,
    ([start, end]) => {
        emit("change", { startTime: start ?? "", endTime: end ?? "" });
    },
    { immediate: true },
);

const timeChanged = computed(
    () =>
        !!values.startTime &&
        !!values.endTime &&
        !isSameTimeRange({ startTime: values.startTime, endTime: values.endTime }, original),
);

const submit = handleSubmit((formValues) => formValues);

function showServerErrors(fieldErrors: Readonly<Record<string, readonly string[]>>): void {
    setErrors({
        startTime: fieldErrors.startTime?.[0],
        endTime: fieldErrors.endTime?.[0],
        purpose: fieldErrors.purpose?.[0],
    });
}

defineExpose({ submit, showServerErrors });
</script>

<template>
    <Container class="@container flex flex-col gap-4">
        <div>
            <div class="flex flex-wrap items-center gap-2">
                <NumberCircle>1</NumberCircle>
                <h2 class="text-lg font-semibold">Reservation details</h2>
                <span class="grow"></span>
                <ReservationStatusChip :state />
            </div>
            <p class="text-text-muted text-sm">
                You can change the time and the purpose. To book another day or room, cancel this
                reservation and make a new one.
            </p>
            <hr class="border-border mt-2" />
        </div>

        <dl class="grid grid-cols-1 gap-3 text-sm @md:grid-cols-3">
            <div class="flex flex-col gap-0.5">
                <dt class="text-text-muted flex items-center gap-1.5">
                    <RectangleStackIcon class="text-text-muted/70 size-4" /> Room
                </dt>
                <dd>
                    <TextLink v-if="roomLink(item.roomInfo.id)" :to="roomLink(item.roomInfo.id)!">
                        {{ item.roomInfo.identifier }}
                    </TextLink>
                    <span v-else class="font-medium">{{ item.roomInfo.identifier }}</span>
                    <span class="text-text-muted text-xs">
                        · {{ formatFloor(item.roomInfo.floor) }}
                    </span>
                </dd>
            </div>
            <div class="flex flex-col gap-0.5">
                <dt class="text-text-muted flex items-center gap-1.5">
                    <BuildingOfficeIcon class="text-text-muted/70 size-4" /> Building
                </dt>
                <dd class="font-medium">{{ item.buildingInfo.name }}</dd>
            </div>
            <div class="flex flex-col gap-0.5">
                <dt class="text-text-muted flex items-center gap-1.5">
                    <CalendarDaysIcon class="text-text-muted/70 size-4" /> Date
                </dt>
                <dd class="font-medium">{{ formatReservationDate(reservation.date) }}</dd>
            </div>
        </dl>

        <div class="grid grid-cols-2 gap-4 @md:max-w-md">
            <BaseInput
                v-model="startTime"
                v-bind="startTimeAttrs"
                type="time"
                label="From"
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
                label="To"
                step="900"
                :readonly
                :is-required="!readonly"
                :class="{ 'bg-background cursor-default': readonly }"
                :error-message="errors.endTime"
            />
        </div>

        <div class="flex flex-col gap-1">
            <label :for="purposeId" class="text-sm font-semibold">Purpose (optional)</label>
            <textarea
                :id="purposeId"
                v-model="purpose"
                v-bind="purposeAttrs"
                rows="3"
                :readonly
                :maxlength="PURPOSE_MAX_LENGTH"
                class="text-text focus-visible:ring-primary w-full resize-none rounded border px-2 py-1 text-sm outline-none focus-visible:ring-2"
                :class="[
                    errors.purpose ? 'border-danger' : 'border-border',
                    { 'bg-background cursor-default': readonly },
                ]"
            ></textarea>
            <div v-if="!readonly" class="flex justify-between gap-2 text-xs">
                <span class="text-danger">{{ errors.purpose }}</span>
                <span class="text-text-muted tabular-nums">
                    {{ purpose?.length ?? 0 }}/{{ PURPOSE_MAX_LENGTH }}
                </span>
            </div>
        </div>

        <p
            v-if="!readonly && timeChanged && item.roomInfo.requiresApproval"
            class="bg-warning/10 border-warning text-warning-text rounded border-l-4 px-3 py-2 text-xs"
        >
            This room requires approval. After changing the time, the reservation will wait for
            approval again.
        </p>
    </Container>
</template>
