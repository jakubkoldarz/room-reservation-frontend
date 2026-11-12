<script setup lang="ts">
import { computed } from "vue";
import type { ReservationListItem } from "@/features/reservations/types";
import { formatReservationTime } from "@/features/reservations/utils/reservationDetails";
import { useRoomDestination } from "@/features/rooms/composables/useRoomDestination";
import TextLink from "@/features/shared/TextLink.vue";
import { toIsoDate } from "@/utils/isoDate";
import { dateTile } from "../utils/upcoming";

const { item, now } = defineProps<{
    item: ReservationListItem;
    now: Date;
}>();

const { roomLink } = useRoomDestination();

const tile = computed(() => dateTile(item.reservationInfo.date));
const isToday = computed(() => item.reservationInfo.date === toIsoDate(now));
const link = computed(() => roomLink(item.roomInfo.id));
</script>

<template>
    <li class="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
        <time
            :datetime="item.reservationInfo.date"
            class="grid w-12 shrink-0 justify-items-center rounded-lg py-1"
            :class="isToday ? 'bg-primary/10' : 'bg-background'"
        >
            <span class="text-xs" :class="isToday ? 'text-primary' : 'text-text-muted'">
                {{ isToday ? "Today" : tile.weekday }}
            </span>
            <span class="text-lg leading-tight font-bold" :class="{ 'text-primary': isToday }">
                {{ tile.day }}
            </span>
            <span class="text-xs" :class="isToday ? 'text-primary' : 'text-text-muted'">
                {{ tile.month }}
            </span>
        </time>
        <div class="flex min-w-0 flex-1 flex-col gap-0.5">
            <div class="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <span class="text-sm font-semibold tabular-nums">
                    {{ formatReservationTime(item.reservationInfo) }}
                </span>
                <slot name="status" />
            </div>
            <p class="text-text-muted truncate text-xs">
                <TextLink v-if="link" :to="link">{{ item.roomInfo.identifier }}</TextLink>
                <span v-else class="font-medium">{{ item.roomInfo.identifier }}</span>
                · {{ item.buildingInfo.name }}
            </p>
            <slot />
        </div>
    </li>
</template>
