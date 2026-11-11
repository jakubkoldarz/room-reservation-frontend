<script setup lang="ts">
import {
    ComputerDesktopIcon,
    EnvelopeIcon,
    IdentificationIcon,
    ShieldCheckIcon,
    UserIcon,
} from "@heroicons/vue/24/solid";
import { computed } from "vue";
import Badge from "@/features/shared/Badge.vue";
import Container from "@/features/shared/Container.vue";
import TextLink from "@/features/shared/TextLink.vue";
import type { UserDetails } from "@/features/users/types";

const { user } = defineProps<{
    user: UserDetails;
}>();

const fullName = computed(() =>
    [user.userInfo.firstname, user.userInfo.lastname].filter(Boolean).join(" "),
);

const securityTab = { query: { tab: "security" } };
</script>

<template>
    <Container>
        <h2 class="text-lg font-semibold">Account</h2>
        <hr class="border-border mt-2" />

        <dl class="divide-border divide-y text-sm">
            <div class="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                <dt class="text-text-muted flex shrink-0 items-center gap-2 sm:w-48">
                    <UserIcon class="text-text-muted/70 size-4" /> Name
                </dt>
                <dd class="text-text min-w-0 truncate font-medium">{{ fullName || "No name" }}</dd>
            </div>

            <div class="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                <dt class="text-text-muted flex shrink-0 items-center gap-2 sm:w-48">
                    <EnvelopeIcon class="text-text-muted/70 size-4" /> Email
                </dt>
                <dd class="flex min-w-0 flex-wrap items-center gap-2">
                    <span class="text-text font-medium break-all">{{ user.email }}</span>
                    <Badge
                        :type="user.accountStatus.hasEmailVerified ? 'success' : 'warning'"
                        class="px-2!"
                    >
                        {{ user.accountStatus.hasEmailVerified ? "Verified" : "Not verified" }}
                    </Badge>
                    <span v-if="user.pendingEmail" class="text-text-muted w-full text-xs">
                        Change to {{ user.pendingEmail }} is not confirmed.
                    </span>
                </dd>
            </div>

            <div class="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                <dt class="text-text-muted flex shrink-0 items-center gap-2 sm:w-48">
                    <IdentificationIcon class="text-text-muted/70 size-4" /> Role
                </dt>
                <dd class="text-text font-medium">{{ user.roleInfo.role }}</dd>
            </div>

            <div class="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                <dt class="text-text-muted flex shrink-0 items-center gap-2 sm:w-48">
                    <ShieldCheckIcon class="text-text-muted/70 size-4" /> Two-step verification
                </dt>
                <dd class="flex items-center gap-3">
                    <Badge
                        :type="user.accountStatus.has2faEnabled ? 'success' : 'warning'"
                        class="px-2!"
                    >
                        {{ user.accountStatus.has2faEnabled ? "On" : "Off" }}
                    </Badge>
                    <TextLink :to="securityTab" class="text-primary! text-xs">Change</TextLink>
                </dd>
            </div>

            <div class="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                <dt class="text-text-muted flex shrink-0 items-center gap-2 sm:w-48">
                    <ComputerDesktopIcon class="text-text-muted/70 size-4" /> Active sessions
                </dt>
                <dd class="flex items-center gap-3">
                    <span class="text-text font-medium tabular-nums">
                        {{ user.refreshTokens.length }}
                    </span>
                    <TextLink :to="securityTab" class="text-primary! text-xs">Manage</TextLink>
                </dd>
            </div>
        </dl>
    </Container>
</template>
