<script setup lang="ts">
import { computed } from "vue";
import Container from "@/features/shared/Container.vue";
import type { RoleInfo } from "@/features/users/types";
import { groupPermissions } from "../utils/permissions";

const { roleInfo } = defineProps<{
    roleInfo: RoleInfo;
}>();

const groups = computed(() => groupPermissions(roleInfo.permissions));
</script>

<template>
    <Container>
        <div class="flex flex-wrap items-baseline gap-x-2">
            <h2 class="text-lg font-semibold">Permissions</h2>
            <span class="text-text-muted text-sm">from the {{ roleInfo.role }} role</span>
        </div>
        <hr class="border-border mt-2" />

        <ul v-if="groups.length > 0" class="divide-border divide-y text-sm">
            <li
                v-for="group in groups"
                :key="group.area"
                class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
            >
                <span class="text-text shrink-0 font-medium sm:w-48">{{ group.area }}</span>
                <span class="flex flex-wrap gap-1.5">
                    <span
                        v-for="action in group.actions"
                        :key="action"
                        class="bg-primary/10 text-primary border-primary rounded border-l-4 px-2 py-0.5 text-xs font-medium"
                    >
                        {{ action }}
                    </span>
                </span>
            </li>
        </ul>
        <p v-else class="text-text-muted pt-3 text-sm">This role has no permissions.</p>
    </Container>
</template>
