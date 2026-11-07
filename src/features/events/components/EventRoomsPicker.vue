<script setup lang="ts">
import { CheckIcon, ChevronDownIcon } from "@heroicons/vue/24/solid";
import { computed, ref } from "vue";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import type { RoomListItem } from "@/features/rooms/types";
import { formatFloor } from "@/features/rooms/utils/formatRoom";
import Container from "@/features/shared/Container.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
import Searchbar from "@/features/shared/Searchbar.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import type { BuildingRoomGroup } from "../types";
import { groupRoomsByBuilding, selectionState, toggleRooms } from "../utils/roomGroups";

const {
    rooms,
    isLoading = false,
    error,
} = defineProps<{
    rooms: readonly RoomListItem[];
    isLoading?: boolean;
    error?: string;
}>();

const selectedIds = defineModel<string[]>({ default: () => [] });

const search = ref("");
const expanded = ref<Set<string>>(new Set());

const groups = computed(() => groupRoomsByBuilding(rooms, search.value));
const isSearching = computed(() => search.value.trim() !== "");

function isExpanded(group: BuildingRoomGroup): boolean {
    return isSearching.value || expanded.value.has(group.id);
}

function toggleExpanded(group: BuildingRoomGroup): void {
    const next = new Set(expanded.value);
    if (next.has(group.id)) next.delete(group.id);
    else next.add(group.id);
    expanded.value = next;
}

function roomIdsOf(group: BuildingRoomGroup): string[] {
    return group.rooms.map((room) => room.id);
}

function stateOf(group: BuildingRoomGroup) {
    return selectionState(roomIdsOf(group), selectedIds.value);
}

function selectedCount(group: BuildingRoomGroup): number {
    return roomIdsOf(group).filter((id) => selectedIds.value.includes(id)).length;
}

function toggleBuilding(group: BuildingRoomGroup): void {
    selectedIds.value = toggleRooms(selectedIds.value, roomIdsOf(group), stateOf(group) !== "all");
}

function toggleRoom(roomId: string): void {
    const isSelected = selectedIds.value.includes(roomId);
    selectedIds.value = toggleRooms(selectedIds.value, [roomId], !isSelected);
}

const selectedBuildings = computed(
    () => groupRoomsByBuilding(rooms).filter((group) => selectedCount(group) > 0).length,
);
</script>

<template>
    <Container class="@container flex flex-col gap-3">
        <div>
            <div class="flex flex-wrap items-center gap-2">
                <NumberCircle>2</NumberCircle>
                <h2 class="text-lg font-semibold">Rooms</h2>
                <span class="grow"></span>
                <span class="text-text-muted text-sm">
                    <span class="text-text font-semibold">{{ selectedIds.length }}</span>
                    {{ selectedIds.length === 1 ? "room" : "rooms" }}
                    <template v-if="selectedBuildings > 1">
                        in {{ selectedBuildings }} buildings
                    </template>
                </span>
                <PlainButton
                    v-if="selectedIds.length > 0"
                    type="button"
                    class="text-xs"
                    @click="selectedIds = []"
                >
                    Clear
                </PlainButton>
            </div>
            <p class="text-text-muted text-sm">
                Select whole buildings or single rooms. The event applies to every selected room.
            </p>
            <hr class="border-border mt-2" />
        </div>

        <Searchbar
            v-model="search"
            placeholder="Search rooms or buildings..."
            class="border-border"
        />

        <div v-if="isLoading" class="flex flex-col gap-2">
            <Skeleton v-for="n in 4" :key="n" class="h-12 w-full" />
        </div>

        <ul v-else class="flex max-h-[28rem] flex-col gap-2 overflow-y-auto p-0.5">
            <li
                v-for="group in groups"
                :key="group.id"
                class="border-border rounded-lg border"
                :class="{ 'border-primary/40': stateOf(group) !== 'none' }"
            >
                <div class="flex items-center gap-3 px-3 py-2">
                    <input
                        type="checkbox"
                        class="accent-primary size-4 shrink-0 cursor-pointer"
                        :checked="stateOf(group) === 'all'"
                        :indeterminate="stateOf(group) === 'some'"
                        :aria-label="`Select all rooms in ${group.name}`"
                        @change="toggleBuilding(group)"
                    />
                    <button
                        type="button"
                        class="focus-visible:ring-primary flex min-w-0 grow cursor-pointer items-center gap-2 rounded text-left outline-none focus-visible:ring-2"
                        :aria-expanded="isExpanded(group)"
                        @click="toggleExpanded(group)"
                    >
                        <span class="flex min-w-0 grow flex-col">
                            <span class="text-text truncate text-sm font-semibold">
                                {{ group.name }}
                            </span>
                            <span class="text-text-muted truncate text-xs">{{
                                group.address
                            }}</span>
                        </span>
                        <span class="text-text-muted shrink-0 text-xs tabular-nums">
                            {{ selectedCount(group) }} / {{ group.rooms.length }}
                        </span>
                        <ChevronDownIcon
                            class="text-text-muted size-4 shrink-0 transition-transform"
                            :class="{ 'rotate-180': isExpanded(group) }"
                        />
                    </button>
                </div>

                <div
                    v-if="isExpanded(group)"
                    class="border-border grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2 border-t p-2"
                >
                    <button
                        v-for="room in group.rooms"
                        :key="room.id"
                        type="button"
                        :aria-pressed="selectedIds.includes(room.id)"
                        class="focus-visible:ring-primary flex items-center gap-2 rounded-lg border px-3 py-1.5 text-left transition-colors outline-none focus-visible:ring-2"
                        :class="
                            selectedIds.includes(room.id)
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/40'
                        "
                        @click="toggleRoom(room.id)"
                    >
                        <span class="flex min-w-0 grow flex-col">
                            <span
                                class="truncate text-sm font-medium"
                                :class="
                                    selectedIds.includes(room.id) ? 'text-primary' : 'text-text'
                                "
                            >
                                {{ room.identifier }}
                            </span>
                            <span class="text-text-muted truncate text-xs">
                                {{ formatFloor(room.floor) }}
                            </span>
                        </span>
                        <CheckIcon
                            v-if="selectedIds.includes(room.id)"
                            class="text-primary size-4 shrink-0"
                        />
                    </button>
                </div>
            </li>
        </ul>

        <p v-if="!isLoading && rooms.length === 0" class="text-text-muted text-sm">
            No rooms available.
        </p>
        <p v-else-if="!isLoading && groups.length === 0" class="text-text-muted text-sm">
            No rooms or buildings match "{{ search }}".
        </p>
        <p v-if="error" class="text-danger text-sm">{{ error }}</p>
    </Container>
</template>
