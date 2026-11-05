<script setup lang="ts">
import { useIntervalFn, useNow } from "@vueuse/core";
import { computed } from "vue";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
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

const days = computed(() =>
    buildCalendarDays({
        weekStart: weekStart.value,
        now: now.value,
        reservations: [],
        events: [],
        availabilities: [],
        requiresApproval: false,
    }),
);
const hours = computed(() => hourRange([], days.value));
</script>

<template>
    <AsideNavbarLayout>
        <div v-if="user" class="@container">
            <div class="flex flex-col gap-4 @5xl:flex-row @5xl:items-start">
                <div class="flex flex-col gap-4 @5xl:order-2 @5xl:w-80 @5xl:shrink-0">
                    <ProfileCard :user />
                    <ProfileDetailsForm :user-info="user.userInfo" />
                    <EmailSettings :email="user.email" :pending-email="user.pendingEmail" />
                    <SecuritySettings :has2fa-enabled="user.accountStatus.has2faEnabled" />
                </div>
                <div class="flex min-w-0 flex-1 flex-col gap-4 @5xl:order-1">
                    <ActiveSessions :sessions="user.refreshTokens" />
                    <RoomCalendar
                        title="My reservations"
                        notice="Booking rooms is not available yet. Your reservations will show up here."
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
                </div>
            </div>
        </div>
    </AsideNavbarLayout>
</template>
