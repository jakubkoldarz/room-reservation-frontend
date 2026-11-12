<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import AccountOverview from "../components/AccountOverview.vue";
import ActiveSessions from "../components/ActiveSessions.vue";
import ChangePasswordForm from "../components/ChangePasswordForm.vue";
import EmailSettings from "../components/EmailSettings.vue";
import MyReservationsCalendar from "../components/MyReservationsCalendar.vue";
import MyReservationsList from "../components/MyReservationsList.vue";
import ProfileDetailsForm from "../components/ProfileDetailsForm.vue";
import ProfileHeader from "../components/ProfileHeader.vue";
import RolePermissions from "../components/RolePermissions.vue";
import TwoFactorSettings from "../components/TwoFactorSettings.vue";
import { ProfileTabSchema } from "../schemas";
import type { ProfileTab } from "../types";

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);

const tab = computed(() => ProfileTabSchema.parse(route.query.tab));

function selectTab(next: ProfileTab): void {
    if (next === tab.value) return;
    void router.push({ query: next === "calendar" ? {} : { tab: next } });
}
</script>

<template>
    <div v-if="user" class="@container flex flex-col gap-4">
        <ProfileHeader :user :tab @select="selectTab" />

        <section
            :id="`profile-panel-${tab}`"
            role="tabpanel"
            :aria-labelledby="`profile-tab-${tab}`"
        >
            <MyReservationsCalendar v-if="tab === 'calendar'" />

            <MyReservationsList v-else-if="tab === 'reservations'" />

            <div
                v-else-if="tab === 'security'"
                class="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-2"
            >
                <EmailSettings :email="user.email" :pending-email="user.pendingEmail" />
                <ChangePasswordForm class="@4xl:row-span-2" />
                <TwoFactorSettings :has2fa-enabled="user.accountStatus.has2faEnabled" />
                <ActiveSessions :sessions="user.refreshTokens" class="min-w-0 @4xl:col-span-2" />
            </div>

            <div
                v-else
                class="grid grid-cols-1 items-start gap-4 @4xl:grid-cols-[minmax(0,1fr)_22rem]"
            >
                <AccountOverview :user class="min-w-0" />
                <ProfileDetailsForm :user-info="user.userInfo" class="@4xl:row-span-2" />
                <RolePermissions :role-info="user.roleInfo" class="min-w-0" />
            </div>
        </section>
    </div>
</template>
