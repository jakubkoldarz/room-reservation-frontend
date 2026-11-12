<script setup lang="ts">
import { computed } from "vue";
import apiClient from "@/api/client";
import { apiErrorMessage } from "@/api/errors";
import { usePagedList } from "@/composables/usePagedList";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import { eventRoutes } from "@/features/events/routes";
import type { EventInfo } from "@/features/events/types";
import { eventHours, formatEventDates } from "@/features/events/utils/eventFormat";
import { BLOCK_CLASSES } from "@/features/rooms/utils/calendarStyles";
import ErrorText from "@/features/shared/ErrorText.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import { toIsoDate } from "@/utils/isoDate";
import DashboardSection from "./DashboardSection.vue";

const VISIBLE_EVENTS = 3;

const { now } = defineProps<{
    now: Date;
}>();

const { hasPermission } = usePermissions();
const canEdit = hasPermission(Permission.EventEdit);
const todayIso = computed(() => toIsoDate(now));

const { data, isLoading, error } = usePagedList(
    (queries) => apiClient.getEvents({ queries }),
    () => ({
        DateFrom: todayIso.value,
        SortBy: "startDate",
        SortDirection: "asc",
        PageSize: VISIBLE_EVENTS,
    }),
);

const events = computed(() => data.value?.items ?? []);
const hiddenCount = computed(() => (data.value?.totalCount ?? 0) - events.value.length);
const listLink = { name: eventRoutes.list.name };

function roomsLabel(event: EventInfo): string {
    if (event.rooms.length === 1) return event.rooms[0].identifier;
    return `${event.rooms.length} rooms`;
}
</script>

<template>
    <DashboardSection title="Upcoming events">
        <template #action>
            <TextLink :to="listLink">All events</TextLink>
        </template>

        <div v-if="isLoading && events.length === 0" class="flex flex-col gap-2">
            <Skeleton v-for="n in VISIBLE_EVENTS" :key="n" class="w-full" />
        </div>
        <ErrorText v-else-if="error" :error="apiErrorMessage(error)" class="mb-0! text-left" />
        <p v-else-if="events.length === 0" class="text-text-muted text-sm">No upcoming events.</p>
        <template v-else>
            <ul class="flex flex-col gap-1.5">
                <li
                    v-for="event in events"
                    :key="event.id"
                    class="flex flex-col rounded border-l-4 px-2.5 py-1.5"
                    :class="event.isClosed ? BLOCK_CLASSES.closed : BLOCK_CLASSES.event"
                >
                    <TextLink
                        v-if="canEdit"
                        :to="{ name: eventRoutes.edit.name, params: { eventId: event.id } }"
                        class="truncate text-sm"
                    >
                        {{ event.name }}
                    </TextLink>
                    <span v-else class="truncate text-sm font-medium">{{ event.name }}</span>
                    <span class="text-text-muted text-xs">{{ formatEventDates(event) }}</span>
                    <span class="text-text-muted truncate text-xs">
                        {{ event.isClosed ? "Room closed" : eventHours(event) }} ·
                        {{ roomsLabel(event) }}
                    </span>
                </li>
            </ul>
            <TextLink v-if="hiddenCount > 0" :to="listLink" class="mt-2 self-start text-xs">
                +{{ hiddenCount }} more
            </TextLink>
        </template>
    </DashboardSection>
</template>
