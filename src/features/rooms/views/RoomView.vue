<script setup lang="ts">
import { computed, ref, shallowRef, watch } from "vue";
import { useRoute } from "vue-router";
import { useIntervalFn, useNow } from "@vueuse/core";
import { z } from "zod";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import ErrorText from "@/features/shared/ErrorText.vue";
import RoomCalendar from "../components/RoomCalendar.vue";
import RoomInfoPanel from "../components/RoomInfoPanel.vue";
import { useCalendarWeek } from "../composables/useCalendarWeek";
import type { RoomSummary } from "../types";
import { buildCalendarDays, hourRange } from "../utils/calendar";

const route = useRoute();
const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });

const roomId = computed(() => {
    const parsed = z.string().uuid().safeParse(route.params.roomId);
    return parsed.success ? parsed.data : null;
});

const room = shallowRef<RoomSummary | null>(null);
const loadError = ref<string | null>(null);
const isLoading = ref(false);

async function load(id: string | null): Promise<void> {
    room.value = null;
    loadError.value = null;
    if (!id) {
        loadError.value = "Room not found.";
        return;
    }

    isLoading.value = true;
    const result = await apiCall(() => apiClient.getRoomsRoomId({ params: { roomId: id } }));
    isLoading.value = false;

    if (result.ok) room.value = result.data;
    else loadError.value = apiErrorMessage(result.error);
}

watch(roomId, load, { immediate: true });

const { weekStart, isCurrentWeek, weekLabel, showPreviousWeek, showNextWeek, showCurrentWeek } =
    useCalendarWeek(now);

const days = computed(() =>
    buildCalendarDays({
        weekStart: weekStart.value,
        now: now.value,
        reservations: room.value?.reservations ?? [],
        events: room.value?.events ?? [],
        availabilities: room.value?.availabilities ?? [],
        requiresApproval: room.value?.details.roomInfo.requiresApproval ?? false,
    }),
);
const hours = computed(() => hourRange(room.value?.availabilities ?? [], days.value));
</script>

<template>
    <AsideNavbarLayout>
        <div class="@container">
            <ErrorText v-if="loadError" :error="loadError" />
            <div v-else class="flex flex-col gap-4 @5xl:flex-row @5xl:items-start">
                <RoomInfoPanel
                    :room
                    :now
                    :is-loading
                    class="@5xl:sticky @5xl:top-4 @5xl:order-2 @5xl:w-80 @5xl:shrink-0"
                />
                <RoomCalendar
                    :days
                    :hours
                    :now
                    :week-label
                    :is-current-week
                    :is-loading
                    class="min-w-0 flex-1 @5xl:order-1"
                    @previous="showPreviousWeek"
                    @next="showNextWeek"
                    @today="showCurrentWeek"
                />
            </div>
        </div>
    </AsideNavbarLayout>
</template>
