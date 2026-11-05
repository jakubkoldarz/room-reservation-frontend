<script setup lang="ts">
import { useIntervalFn, useNow } from "@vueuse/core";
import { computed } from "vue";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { useMyReservations } from "@/features/reservations/composables/useMyReservations";
import RoomCalendar from "@/features/rooms/components/RoomCalendar.vue";
import { useCalendarWeek } from "@/features/rooms/composables/useCalendarWeek";
import { buildCalendarDays, hourRange } from "@/features/rooms/utils/calendar";
import ActiveSessions from "../components/ActiveSessions.vue";
import EmailSettings from "../components/EmailSettings.vue";
import ProfileCard from "../components/ProfileCard.vue";
import ProfileDetailsForm from "../components/ProfileDetailsForm.vue";
import SecuritySettings from "../components/SecuritySettings.vue";

const authStore = useAuthStore();
const user = computed(() => authStore.user);

const now = useNow({ scheduler: (tick) => useIntervalFn(tick, 60_000) });
const { weekStart, isCurrentWeek, weekLabel, showPreviousWeek, showNextWeek, showCurrentWeek } =
    useCalendarWeek(now);

const {
    items: myReservations,
    isLoading: isLoadingReservations,
    error: reservationsError,
} = useMyReservations(weekStart);

const roomLabels = computed(
    () =>
        new Map(
            myReservations.value.map((item) => [
                item.reservationInfo.id,
                `${item.roomInfo.identifier} · ${item.buildingInfo.name}`,
            ]),
        ),
);

const days = computed(() =>
    buildCalendarDays({
        weekStart: weekStart.value,
        now: now.value,
        reservations: myReservations.value.map((item) => item.reservationInfo),
        events: [],
        availabilities: [],
        requiresApproval: false,
        reservationTitle: {
            label: "Room",
            of: (reservation) => roomLabels.value.get(reservation.id) ?? "Unknown room",
        },
    }),
);
const hours = computed(() => hourRange([], days.value));
</script>

<template>
    <AsideNavbarLayout>
        <div v-if="user" class="@container flex flex-col gap-4">
            <RoomCalendar
                title="My reservations"
                class="order-2 @5xl:order-1"
                :notice="reservationsError ?? undefined"
                :is-loading="isLoadingReservations"
                :days
                :hours
                :now
                :week-label
                :is-current-week
                :show-opening-hours="false"
                @previous="showPreviousWeek"
                @next="showNextWeek"
                @today="showCurrentWeek"
            />
            <div class="order-1 flex flex-col gap-4 @5xl:order-2 @5xl:flex-row @5xl:items-start">
                <div class="flex flex-col gap-4 @5xl:order-2 @5xl:w-80 @5xl:shrink-0">
                    <ProfileCard :user />
                    <ProfileDetailsForm :user-info="user.userInfo" />
                    <EmailSettings :email="user.email" :pending-email="user.pendingEmail" />
                    <SecuritySettings :has2fa-enabled="user.accountStatus.has2faEnabled" />
                </div>
                <ActiveSessions
                    :sessions="user.refreshTokens"
                    class="min-w-0 flex-1 @5xl:order-1"
                />
            </div>
        </div>
    </AsideNavbarLayout>
</template>
