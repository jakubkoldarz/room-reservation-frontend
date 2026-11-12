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
    PlusIcon,
} from "@heroicons/vue/24/solid";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import OpenStatusLabel from "@/features/availabilities/components/OpenStatusLabel.vue";
import { DAYS_MONDAY_FIRST, formatHours } from "@/features/availabilities/utils/schedule";
import { buildingRoutes } from "@/features/buildings/routes";
import { formatAddress } from "@/features/buildings/utils/formatAddres";
import { iconFor } from "@/features/equipment/icons";
import { eventRoutes } from "@/features/events/routes";
import { eventHours, formatEventDates } from "@/features/events/utils/eventFormat";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import { roomRoutes } from "../routes";
import type { RoomSummary } from "../types";
import { BLOCK_CLASSES } from "../utils/calendarStyles";
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

const VISIBLE_EVENTS = 3;

const sortedEvents = computed(() =>
    [...(room?.events ?? [])].sort((a, b) => a.startDate.localeCompare(b.startDate)),
);
const visibleEvents = computed(() => sortedEvents.value.slice(0, VISIBLE_EVENTS));
const hiddenEventsCount = computed(() => sortedEvents.value.length - visibleEvents.value.length);
const showEvents = computed(
    () => sortedEvents.value.length > 0 || hasPermission(Permission.EventAdd),
);

async function addEvent(): Promise<void> {
    if (info.value)
        await router.push({ name: eventRoutes.add.name, query: { roomId: info.value.id } });
}

async function goToEdit(): Promise<void> {
    if (info.value)
        await router.push({ name: roomRoutes.edit.name, params: { roomId: info.value.id } });
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
                <OpenStatusLabel :availabilities="room.availabilities" :events="room.events" :now />
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
                <ul class="-mx-2 flex flex-col gap-0.5 text-sm tabular-nums">
                    <li
                        v-for="row in openingHours"
                        :key="row.dayOfWeek"
                        class="flex justify-between gap-2 rounded px-2 py-0.5"
                        :class="row.isToday ? 'bg-primary/10 text-primary font-semibold' : ''"
                        :aria-current="row.isToday ? 'date' : undefined"
                    >
                        <span>
                            {{ row.day }}
                            <span v-if="row.isToday" class="ml-1 text-xs font-normal">Today</span>
                        </span>
                        <span v-if="row.hours">{{ row.hours }}</span>
                        <span v-else :class="{ 'text-text-muted': !row.isToday }">Closed</span>
                    </li>
                </ul>
            </section>

            <section v-if="showEvents" class="flex flex-col gap-2">
                <div class="flex items-center justify-between gap-2">
                    <h2 class="text-text-muted text-xs font-semibold uppercase">Upcoming events</h2>
                    <PlainButton
                        v-if="hasPermission(Permission.EventAdd)"
                        type="button"
                        class="text-xs"
                        @click="addEvent"
                    >
                        <PlusIcon class="size-4" /> Add event
                    </PlainButton>
                </div>
                <ul v-if="visibleEvents.length > 0" class="flex flex-col gap-1.5">
                    <li
                        v-for="event in visibleEvents"
                        :key="event.id"
                        class="flex flex-col rounded border-l-4 px-2.5 py-1.5"
                        :class="event.isClosed ? BLOCK_CLASSES.closed : BLOCK_CLASSES.event"
                    >
                        <TextLink
                            v-if="hasPermission(Permission.EventEdit)"
                            :to="{ name: eventRoutes.edit.name, params: { eventId: event.id } }"
                            class="truncate text-sm"
                        >
                            {{ event.name }}
                        </TextLink>
                        <span v-else class="text-text truncate text-sm font-medium">
                            {{ event.name }}
                        </span>
                        <span class="text-text-muted text-xs">
                            {{ formatEventDates(event) }} ·
                            {{ event.isClosed ? "Room closed" : eventHours(event) }}
                        </span>
                    </li>
                </ul>
                <p v-else class="text-text-muted text-sm">No upcoming events</p>
                <TextLink
                    v-if="hiddenEventsCount > 0 && hasPermission(Permission.EventList)"
                    :to="{ name: eventRoutes.list.name, query: { room: room.details.roomInfo.id } }"
                    class="self-start text-xs"
                >
                    +{{ hiddenEventsCount }} more
                </TextLink>
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
