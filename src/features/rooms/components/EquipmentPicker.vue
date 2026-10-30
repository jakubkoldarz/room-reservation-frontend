<script setup lang="ts">
import { computed, ref } from "vue";
import { CheckIcon } from "@heroicons/vue/24/solid";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import { iconFor } from "@/features/equipment/icons";
import type { Equipment } from "@/features/equipment/types";
import Container from "@/features/shared/Container.vue";
import Searchbar from "@/features/shared/Searchbar.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import { MAX_ROOM_EQUIPMENT } from "../schemas";

const {
    equipment,
    isLoading = false,
    error,
} = defineProps<{
    equipment: readonly Equipment[];
    isLoading?: boolean;
    error?: string;
}>();

const selectedIds = defineModel<string[]>({ default: () => [] });

const search = ref("");

const results = computed(() => {
    const needle = search.value.trim().toLowerCase();
    if (!needle) return equipment;
    return equipment.filter((item) => item.name.toLowerCase().includes(needle));
});

const isFull = computed(() => selectedIds.value.length >= MAX_ROOM_EQUIPMENT);

function isSelected(item: Equipment): boolean {
    return selectedIds.value.includes(item.id);
}

function toggle(item: Equipment): void {
    if (isSelected(item)) {
        selectedIds.value = selectedIds.value.filter((id) => id !== item.id);
    } else if (!isFull.value) {
        selectedIds.value = [...selectedIds.value, item.id];
    }
}
</script>

<template>
    <Container class="@container flex flex-col gap-2">
        <div>
            <div class="flex items-center gap-2">
                <NumberCircle>2</NumberCircle>
                <h2 class="text-lg font-semibold">Equipment</h2>
                <span class="grow"></span>
                <span
                    class="text-sm font-semibold"
                    :class="isFull ? 'text-warning-text' : 'text-text-muted'"
                >
                    {{ selectedIds.length }} / {{ MAX_ROOM_EQUIPMENT }}
                </span>
            </div>
            <p class="text-text-muted text-sm">
                Select up to {{ MAX_ROOM_EQUIPMENT }} pieces of equipment available in the room.
            </p>
            <hr class="border-border my-2" />
        </div>

        <Searchbar v-model="search" placeholder="Search equipment..." class="border-border" />

        <div v-if="isLoading" class="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2 p-1">
            <Skeleton v-for="n in 6" :key="n" class="h-10 w-full" />
        </div>

        <div
            v-else
            class="grid max-h-72 grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-2 overflow-y-auto p-1"
        >
            <button
                v-for="item in results"
                :key="item.id"
                type="button"
                :title="item.name"
                :aria-pressed="isSelected(item)"
                :disabled="!isSelected(item) && isFull"
                class="focus-visible:ring-primary flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
                :class="
                    isSelected(item)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-text/65 enabled:hover:border-primary/40 enabled:hover:text-primary'
                "
                @click="toggle(item)"
            >
                <component :is="iconFor(item.icon)" class="size-5 shrink-0" />
                <span class="min-w-0 grow truncate">{{ item.name }}</span>
                <CheckIcon v-if="isSelected(item)" class="size-4 shrink-0" />
            </button>
        </div>

        <p v-if="!isLoading && equipment.length === 0" class="text-text-muted text-sm">
            No equipment available.
        </p>
        <p v-else-if="!isLoading && results.length === 0" class="text-text-muted text-sm">
            No equipment matches "{{ search }}".
        </p>
        <p v-if="error" class="text-danger text-sm">{{ error }}</p>
    </Container>
</template>
