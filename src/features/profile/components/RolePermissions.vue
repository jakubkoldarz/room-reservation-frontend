<script setup lang="ts">
import { computed } from "vue";
import Container from "@/features/shared/Container.vue";
import type { RoleInfo } from "@/features/users/types";
import type { PermissionActionKind } from "../types";
import { ACTION_KIND_LABELS, groupPermissions } from "../utils/permissions";

const { roleInfo } = defineProps<{
    roleInfo: RoleInfo;
}>();

const CHIP_CLASSES: Record<PermissionActionKind, string> = {
    read: "bg-text-muted/10 text-text-muted border-text-muted/50",
    write: "bg-primary/10 text-primary border-primary",
    decide: "bg-warning/10 text-warning-text border-warning",
    danger: "bg-danger/10 text-danger border-danger",
};

const LEGEND_KINDS: PermissionActionKind[] = ["read", "write", "decide", "danger"];

const groups = computed(() => groupPermissions(roleInfo.permissions));

function chipClass(kind: PermissionActionKind): string {
    return CHIP_CLASSES[kind];
}

function kindLabel(kind: PermissionActionKind): string {
    return ACTION_KIND_LABELS[kind];
}
</script>

<template>
    <Container>
        <div class="flex flex-wrap items-baseline gap-x-2">
            <h2 class="text-lg font-semibold">Permissions</h2>
            <span class="text-text-muted text-sm">from the {{ roleInfo.role }} role</span>
        </div>
        <hr class="border-border mt-2" />

        <template v-if="groups.length > 0">
            <ul class="divide-border divide-y text-sm">
                <li
                    v-for="group in groups"
                    :key="group.area"
                    class="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4"
                >
                    <span class="text-text shrink-0 font-medium sm:w-48">{{ group.area }}</span>
                    <span class="flex flex-wrap gap-1.5">
                        <span
                            v-for="action in group.actions"
                            :key="action.label"
                            class="rounded border-l-4 px-2 py-0.5 text-xs font-medium"
                            :class="chipClass(action.kind)"
                        >
                            {{ action.label }}
                        </span>
                    </span>
                </li>
            </ul>

            <ul
                class="border-border text-text-muted flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-xs"
            >
                <li v-for="kind in LEGEND_KINDS" :key="kind" class="flex items-center gap-1.5">
                    <span
                        class="h-3 w-3 rounded-sm border-l-4"
                        :class="chipClass(kind)"
                        aria-hidden="true"
                    ></span>
                    {{ kindLabel(kind) }}
                </li>
            </ul>
        </template>
        <p v-else class="text-text-muted pt-3 text-sm">This role has no permissions.</p>
    </Container>
</template>
