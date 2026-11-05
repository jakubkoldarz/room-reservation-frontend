<script setup lang="ts">
import { ShieldCheckIcon } from "@heroicons/vue/24/solid";
import { computed } from "vue";
import Badge from "@/features/shared/Badge.vue";
import Container from "@/features/shared/Container.vue";
import type { UserDetails } from "@/features/users/types";

const { user } = defineProps<{
    user: UserDetails;
}>();

const fullName = computed(() =>
    [user.userInfo.firstname, user.userInfo.lastname].filter(Boolean).join(" "),
);

const initials = computed(() =>
    [user.userInfo.firstname, user.userInfo.lastname]
        .map((part) => part?.trim().charAt(0).toUpperCase() ?? "")
        .join(""),
);
</script>

<template>
    <Container class="flex flex-col gap-4">
        <div class="flex items-center gap-3">
            <span
                class="bg-secondary text-text-secondary grid size-12 shrink-0 place-items-center rounded-full text-lg font-semibold"
                aria-hidden="true"
            >
                {{ initials || "?" }}
            </span>
            <div class="flex min-w-0 flex-col gap-1">
                <h1 class="truncate text-lg font-bold">{{ fullName || "No name" }}</h1>
                <Badge class="px-2!">{{ user.roleInfo.role }}</Badge>
            </div>
        </div>

        <dl class="border-border flex flex-col gap-2 border-t pt-4 text-sm">
            <div class="flex items-center gap-2">
                <ShieldCheckIcon
                    class="size-4 shrink-0"
                    :class="
                        user.accountStatus.has2faEnabled ? 'text-success' : 'text-text-muted/70'
                    "
                />
                <dt class="text-text-muted">Two-step verification</dt>
                <dd class="ml-auto font-medium">
                    {{ user.accountStatus.has2faEnabled ? "On" : "Off" }}
                </dd>
            </div>
        </dl>
    </Container>
</template>
