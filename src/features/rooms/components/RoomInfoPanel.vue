<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import {
    CheckCircleIcon as CheckCircleOutlineIcon,
    ClockIcon as ClockOutlineIcon,
} from "@heroicons/vue/24/outline";
import {
    MapPinIcon,
    PencilSquareIcon,
    Square3Stack3DIcon,
    UsersIcon,
} from "@heroicons/vue/24/solid";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import OpenStatusLabel from "@/features/availabilities/components/OpenStatusLabel.vue";
import { DAYS_MONDAY_FIRST, formatHours } from "@/features/availabilities/utils/schedule";
import { buildingRoutes } from "@/features/buildings/routes";
import { formatAddress } from "@/features/buildings/utils/formatAddres";
import { iconFor } from "@/features/equipment/icons";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import { roomRoutes } from "../routes";
import type { RoomSummary } from "../types";
import {
    approvalDescription,
    approvalShortLabel,
    formatCapacity,
    formatFloor,
} from "../utils/formatRoom";

const {
    room,
    now,
    isLoading = false,
} = defineProps<{
    room: RoomSummary | null;
    now: Date;
    isLoading?: boolean;
}>();

const DAY_SHORT_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const router = useRouter();
const { hasPermission } = usePermissions();

const info = computed(() => room?.details.roomInfo);
const building = computed(() => room?.details.buildingInfo);

const openingHours = computed(() =>
    DAYS_MONDAY_FIRST.map((dayOfWeek) => ({
        dayOfWeek,
        day: DAY_SHORT_NAMES[dayOfWeek],
        hours: formatHours(room?.availabilities ?? [], dayOfWeek),
        isToday: dayOfWeek === now.getDay(),
    })),
);

function goToEdit(): void {
    if (info.value) router.push({ name: roomRoutes.edit.name, params: { roomId: info.value.id } });
}
</script>

<template>
    <Container class="flex flex-col gap-5">
        <template v-if="isLoading || !room || !info || !building">
            <Skeleton class="w-2/3" />
            <Skeleton v-for="n in 6" :key="n" class="w-full" />
        </template>

        <template v-else>
            <div class="flex flex-col gap-1">
                <h1 class="text-xl font-bold break-words">{{ info.identifier }}</h1>
                <OpenStatusLabel :availabilities="room.availabilities" :now />
            </div>

            <div class="flex items-start gap-2 text-sm">
                <MapPinIcon class="text-text-muted/70 mt-0.5 size-4 shrink-0" />
                <div class="min-w-0">
                    <TextLink
                        v-if="hasPermission(Permission.BuildingView)"
                        :to="{
                            name: buildingRoutes.view.name,
                            params: { buildingId: building.id },
                        }"
                    >
                        {{ building.name }}
                    </TextLink>
                    <span v-else class="font-medium">{{ building.name }}</span>
                    <p class="text-text-muted text-xs">{{ formatAddress(building) }}</p>
                </div>
            </div>

            <dl class="grid grid-cols-2 gap-3 text-sm">
                <div class="bg-background flex flex-col gap-1 rounded-lg p-3">
                    <dt class="text-text-muted flex items-center gap-1.5 text-xs">
                        <Square3Stack3DIcon class="size-3.5" /> Floor
                    </dt>
                    <dd class="font-semibold">{{ formatFloor(info.floor) }}</dd>
                </div>
                <div class="bg-background flex flex-col gap-1 rounded-lg p-3">
                    <dt class="text-text-muted flex items-center gap-1.5 text-xs">
                        <UsersIcon class="size-3.5" /> Capacity
                    </dt>
                    <dd class="font-semibold">{{ formatCapacity(info.capacity) }}</dd>
                </div>
                <div class="bg-background col-span-2 flex items-start gap-2 rounded-lg p-3">
                    <ClockOutlineIcon
                        v-if="info.requiresApproval"
                        class="text-warning mt-0.5 size-5 shrink-0"
                    />
                    <CheckCircleOutlineIcon v-else class="text-success mt-0.5 size-5 shrink-0" />
                    <div class="flex flex-col">
                        <dt class="font-semibold">
                            {{ approvalShortLabel(info.requiresApproval) }}
                        </dt>
                        <dd class="text-text-muted text-xs first-letter:uppercase">
                            {{ approvalDescription(info.requiresApproval) }}
                        </dd>
                    </div>
                </div>
            </dl>

            <section class="flex flex-col gap-2">
                <h2 class="text-text-muted text-xs font-semibold uppercase">Equipment</h2>
                <ul v-if="room.details.equipment.length > 0" class="flex flex-wrap gap-1.5">
                    <li
                        v-for="item in room.details.equipment"
                        :key="item.id"
                        class="border-border text-text flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                    >
                        <component :is="iconFor(item.icon)" class="text-text/65 size-4" />
                        {{ item.name }}
                    </li>
                </ul>
                <p v-else class="text-text-muted text-sm">No equipment</p>
            </section>

            <section class="flex flex-col gap-2">
                <h2 class="text-text-muted text-xs font-semibold uppercase">Opening hours</h2>
                <ul class="flex flex-col gap-1 text-sm">
                    <li
                        v-for="row in openingHours"
                        :key="row.dayOfWeek"
                        class="flex justify-between gap-2"
                        :class="row.isToday ? 'text-primary font-semibold' : ''"
                    >
                        <span>{{ row.day }}</span>
                        <span v-if="row.hours">{{ row.hours }}</span>
                        <span v-else :class="{ 'text-text-muted': !row.isToday }">Closed</span>
                    </li>
                </ul>
            </section>

            <BaseButton
                v-if="hasPermission(Permission.RoomEdit)"
                class="w-full justify-center rounded-lg py-2"
                @click="goToEdit"
            >
                <PencilSquareIcon class="size-5" /> Edit room
            </BaseButton>
        </template>
    </Container>
</template>
