<script setup lang="ts">
import { toTypedSchema } from "@vee-validate/zod";
import { useForm } from "vee-validate";
import { computed, ref } from "vue";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import type { ApiError } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { PURPOSE_MAX_LENGTH } from "@/features/reservations/schemas";
import { formatReservationDate } from "@/features/reservations/utils/reservationDetails";
import { useAllRooms } from "@/features/rooms/composables/useAllRooms";
import { roomRoutes } from "@/features/rooms/routes";
import { DARK_CLOSED_HOURS_BACKGROUND } from "@/features/rooms/utils/calendarStyles";
import { approvalShortLabel, formatCapacity, formatFloor } from "@/features/rooms/utils/formatRoom";
import BaseButton from "@/features/shared/BaseButton.vue";
import BaseInput from "@/features/shared/BaseInput.vue";
import ComboBox from "@/features/shared/ComboBox.vue";
import Container from "@/features/shared/Container.vue";
import TextLink from "@/features/shared/TextLink.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";
import { toIsoDate } from "@/utils/isoDate";
import { QuickReservationFormSchema } from "../schemas";
import type { QuickReservationFailure, QuickReservationForm } from "../types";
import {
    calendarWeekOf,
    defaultReservationDraft,
    isAvailabilityFailure,
    reservationFailureMessage,
} from "../utils/quickReservation";

const { now } = defineProps<{
    now: Date;
}>();

const emit = defineEmits<{
    created: [];
}>();

const toasts = useToastsStore();
const { hasPermission } = usePermissions();
const { rooms, isLoading: isLoadingRooms } = useAllRooms();

const isSaving = ref(false);
const failure = ref<QuickReservationFailure | null>(null);

function emptyForm() {
    return { roomId: "", ...defaultReservationDraft(new Date()), purpose: "" };
}

const { handleSubmit, errors, defineField, resetForm, setErrors } = useForm({
    validationSchema: toTypedSchema(QuickReservationFormSchema),
    initialValues: emptyForm(),
});
const [roomId] = defineField("roomId");
const [date, dateAttrs] = defineField("date");
const [startTime, startTimeAttrs] = defineField("startTime");
const [endTime, endTimeAttrs] = defineField("endTime");
const [purpose, purposeAttrs] = defineField("purpose");

const today = computed(() => formatReservationDate(toIsoDate(now)));

const roomOptions = computed(() =>
    rooms.value.map(({ roomInfo, buildingInfo }) => ({
        value: roomInfo.id,
        label: `${roomInfo.identifier} · ${buildingInfo.name}`,
    })),
);

const selectedRoom = computed(
    () => rooms.value.find((room) => room.roomInfo.id === roomId.value) ?? null,
);

const roomSummary = computed(() => {
    if (!selectedRoom.value) return null;
    const { roomInfo, buildingInfo } = selectedRoom.value;
    return [
        buildingInfo.name,
        formatFloor(roomInfo.floor),
        formatCapacity(roomInfo.capacity),
        approvalShortLabel(roomInfo.requiresApproval),
    ].join(" · ");
});

const calendarLink = computed(() => {
    if (!failure.value?.canCheckCalendar || !hasPermission(Permission.RoomView)) return null;
    const week = calendarWeekOf(failure.value.date);
    if (!week) return null;
    return {
        name: roomRoutes.view.name,
        params: { roomId: failure.value.roomId },
        query: { week },
    };
});

function showFailure(error: ApiError, values: QuickReservationForm, roomName: string): void {
    if (error.kind === "validation") {
        setErrors({
            roomId: error.fieldErrors.roomId?.[0],
            date: error.fieldErrors.date?.[0],
            startTime: error.fieldErrors.startTime?.[0],
            endTime: error.fieldErrors.endTime?.[0],
            purpose: error.fieldErrors.purpose?.[0],
        });
    }

    failure.value = {
        message: reservationFailureMessage(error),
        roomId: values.roomId,
        roomName,
        date: values.date,
        canCheckCalendar: isAvailabilityFailure(error),
    };
}

const submit = handleSubmit(async (values) => {
    const room = selectedRoom.value;
    failure.value = null;
    isSaving.value = true;
    const response = await apiCall(() =>
        apiClient.postReservations({
            roomId: values.roomId,
            date: values.date,
            startTime: `${values.startTime}:00`,
            endTime: `${values.endTime}:00`,
            purpose: values.purpose || null,
        }),
    );
    isSaving.value = false;

    let roomName = "the room";
    let requiresApproval = false;
    if (room) {
        roomName = room.roomInfo.identifier;
        requiresApproval = room.roomInfo.requiresApproval;
    }

    if (!response.ok) {
        showFailure(response.error, values, roomName);
        return;
    }

    let message = "The room is booked for you.";
    if (requiresApproval) message = "It is waiting for approval.";
    toasts.pushSuccess({ title: "Reservation created", message });
    resetForm({ values: emptyForm() });
    emit("created");
});
</script>

<template>
    <Container class="@container px-0! py-0!">
        <div
            class="bg-secondary flex items-baseline justify-between gap-3 rounded-t-md px-4 py-3 sm:px-6"
            :style="{ backgroundImage: DARK_CLOSED_HOURS_BACKGROUND }"
        >
            <h2 class="text-text-secondary text-lg font-semibold">New reservation</h2>
            <p class="text-text-muted-secondary text-sm">{{ today }}</p>
        </div>

        <form class="flex flex-col gap-3 p-4 sm:p-6" novalidate @submit="submit">
            <div class="grid gap-3 @3xl:grid-cols-2">
                <ComboBox
                    v-model="roomId"
                    :options="roomOptions"
                    :error-message="errors.roomId"
                    :placeholder="isLoadingRooms ? 'Loading rooms...' : 'Search rooms...'"
                    label="Room"
                    no-results-text="No rooms found"
                />
                <div class="grid grid-cols-2 gap-3 @md:grid-cols-3">
                    <div class="col-span-2 @md:col-span-1">
                        <BaseInput
                            v-model="date"
                            v-bind="dateAttrs"
                            type="date"
                            label="Date"
                            :error-message="errors.date"
                        />
                    </div>
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
            </div>

            <BaseInput
                v-model="purpose"
                v-bind="purposeAttrs"
                label="Purpose (optional)"
                :maxlength="PURPOSE_MAX_LENGTH"
                :error-message="errors.purpose"
            />

            <div
                v-if="failure"
                role="alert"
                class="bg-danger/10 border-danger flex flex-col gap-1 rounded border-l-4 px-3 py-2"
            >
                <p class="text-danger text-sm font-medium">{{ failure.message }}</p>
                <TextLink
                    v-if="calendarLink"
                    :to="calendarLink"
                    class="self-start text-sm underline"
                >
                    Open {{ failure.roomName }} calendar for
                    {{ formatReservationDate(failure.date) }}
                </TextLink>
            </div>

            <div class="flex flex-col gap-3 @lg:flex-row @lg:items-center @lg:justify-between">
                <p v-if="roomSummary" class="text-text-muted min-w-0 text-xs">{{ roomSummary }}</p>
                <BaseButton
                    type="submit"
                    :is-loading="isSaving"
                    class="justify-center py-2 @lg:ml-auto @lg:py-1"
                >
                    Reserve
                </BaseButton>
            </div>
        </form>
    </Container>
</template>
