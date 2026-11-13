<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/24/solid";
import { computed } from "vue";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import Container from "@/features/shared/Container.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import type { PermissionItem, PermissionOptionGroup } from "../types";
import {
    countSelected,
    groupPermissionOptions,
    withIds,
    withoutIds,
} from "../utils/permissionGroups";

const { permissions, isLoading = false } = defineProps<{
    permissions: readonly PermissionItem[];
    isLoading?: boolean;
}>();

const selectedIds = defineModel<string[]>({ default: () => [] });

const groups = computed(() => groupPermissionOptions(permissions));

function optionIds(group: PermissionOptionGroup): string[] {
    const ids: string[] = [];
    for (const option of group.options) {
        ids.push(option.id);
    }
    return ids;
}

function selectedCount(group: PermissionOptionGroup): number {
    return countSelected(optionIds(group), selectedIds.value);
}

function isWholeGroupSelected(group: PermissionOptionGroup): boolean {
    return selectedCount(group) === group.options.length;
}

function isPartOfGroupSelected(group: PermissionOptionGroup): boolean {
    const count = selectedCount(group);
    return count > 0 && count < group.options.length;
}

function isSelected(permissionId: string): boolean {
    return selectedIds.value.includes(permissionId);
}

function toggleGroup(group: PermissionOptionGroup): void {
    if (isWholeGroupSelected(group)) {
        selectedIds.value = withoutIds(selectedIds.value, optionIds(group));
    } else {
        selectedIds.value = withIds(selectedIds.value, optionIds(group));
    }
}

function togglePermission(permissionId: string): void {
    if (isSelected(permissionId)) {
        selectedIds.value = withoutIds(selectedIds.value, [permissionId]);
    } else {
        selectedIds.value = withIds(selectedIds.value, [permissionId]);
    }
}

function clearSelection(): void {
    selectedIds.value = [];
}
</script>

<template>
    <Container class="@container flex flex-col gap-3">
        <div>
            <div class="flex flex-wrap items-center gap-2">
                <NumberCircle>2</NumberCircle>
                <h2 class="text-lg font-semibold">Permissions</h2>
                <span class="grow"></span>
                <span class="text-text-muted text-sm tabular-nums">
                    <span class="text-text font-semibold">{{ selectedIds.length }}</span>
                    / {{ permissions.length }} selected
                </span>
                <PlainButton
                    v-if="selectedIds.length > 0"
                    type="button"
                    class="text-xs"
                    @click="clearSelection"
                >
                    Clear
                </PlainButton>
            </div>
            <p class="text-text-muted text-sm">
                Choose what users with this role can do. The checkbox next to an area selects all of
                its permissions.
            </p>
            <hr class="border-border mt-2" />
        </div>

        <div v-if="isLoading" class="flex flex-col gap-2">
            <Skeleton v-for="n in 5" :key="n" class="h-12 w-full" />
        </div>

        <ul v-else class="flex flex-col gap-2">
            <li
                v-for="group in groups"
                :key="group.area"
                class="border-border flex flex-col gap-2 rounded-lg border px-3 py-2 @2xl:flex-row @2xl:items-center @2xl:gap-4"
                :class="{ 'border-primary/40': selectedCount(group) > 0 }"
            >
                <label class="flex shrink-0 cursor-pointer items-center gap-3 @2xl:w-48">
                    <input
                        type="checkbox"
                        class="accent-primary size-4 shrink-0 cursor-pointer"
                        :checked="isWholeGroupSelected(group)"
                        :indeterminate="isPartOfGroupSelected(group)"
                        @change="toggleGroup(group)"
                    />
                    <span class="text-text grow text-sm font-semibold">{{ group.area }}</span>
                    <span class="text-text-muted text-xs tabular-nums">
                        {{ selectedCount(group) }} / {{ group.options.length }}
                    </span>
                </label>

                <div class="flex flex-wrap gap-1.5">
                    <button
                        v-for="option in group.options"
                        :key="option.id"
                        type="button"
                        :aria-pressed="isSelected(option.id)"
                        class="focus-visible:ring-primary flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2"
                        :class="
                            isSelected(option.id)
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-text hover:border-primary/40'
                        "
                        @click="togglePermission(option.id)"
                    >
                        <CheckIcon v-if="isSelected(option.id)" class="size-3.5 shrink-0" />
                        {{ option.label }}
                    </button>
                </div>
            </li>
        </ul>

        <p v-if="!isLoading && permissions.length === 0" class="text-text-muted text-sm">
            No permissions available.
        </p>
    </Container>
</template>
