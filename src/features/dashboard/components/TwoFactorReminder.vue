<script setup lang="ts">
import { ShieldExclamationIcon, XMarkIcon } from "@heroicons/vue/24/solid";
import { computed } from "vue";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";
import { profileRoutes } from "@/features/profile/routes";
import TextLink from "@/features/shared/TextLink.vue";

const authStore = useAuthStore();

const isVisible = computed(
    () =>
        authStore.user !== null &&
        !authStore.user.accountStatus.has2faEnabled &&
        !authStore.isTwoFactorReminderDismissed,
);

const securityLink = { name: profileRoutes.view.name, query: { tab: "security" } };
</script>

<template>
    <section
        v-if="isVisible"
        aria-label="Two-step verification reminder"
        class="bg-warning/10 border-warning/30 border-l-warning flex items-start gap-3 rounded border border-l-4 px-3 py-2.5"
    >
        <ShieldExclamationIcon class="text-warning mt-0.5 size-5 shrink-0" />
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <p class="text-sm font-semibold">Two-step verification is off</p>
            <p class="text-text-muted text-sm">
                Your account is protected by a password only. Turn it on to also require a code from
                email when you sign in.
            </p>
            <TextLink :to="securityLink" class="self-start text-sm underline">
                Open security settings
            </TextLink>
        </div>
        <button
            type="button"
            aria-label="Dismiss reminder"
            class="text-text-muted hover:text-text focus-visible:ring-primary shrink-0 cursor-pointer rounded outline-none focus-visible:ring-2"
            @click="authStore.dismissTwoFactorReminder()"
        >
            <XMarkIcon class="size-5" />
        </button>
    </section>
</template>
