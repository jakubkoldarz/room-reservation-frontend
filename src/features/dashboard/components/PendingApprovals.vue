<script setup lang="ts">
import { computed } from "vue";
import apiClient from "@/api/client";
import { apiErrorMessage } from "@/api/errors";
import { usePagedList } from "@/composables/usePagedList";
import { reservationRoutes } from "@/features/reservations/routes";
import { reservationStatusCode } from "@/features/reservations/utils/reservationQueries";
import { formatUserName } from "@/features/reservations/utils/reservationState";
import ErrorText from "@/features/shared/ErrorText.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import { toIsoDate } from "@/utils/isoDate";
import DashboardReservationRow from "./DashboardReservationRow.vue";
import DashboardSection from "./DashboardSection.vue";

const VISIBLE_REQUESTS = 3;

const { now } = defineProps<{
    now: Date;
}>();

const todayIso = computed(() => toIsoDate(now));

const { data, isLoading, error, reload } = usePagedList(
    (queries) => apiClient.getReservations({ queries }),
    () => ({
        Status: reservationStatusCode("pending"),
        DateFrom: todayIso.value,
        SortBy: "date",
        SortDirection: "asc",
        PageSize: VISIBLE_REQUESTS,
    }),
);

const items = computed(() => data.value?.items ?? []);
const listLink = { name: reservationRoutes.list.name, query: { status: "pending" } };

defineExpose({ reload });
</script>

<template>
    <DashboardSection title="Waiting for approval" :count="data?.totalCount">
        <template #action>
            <TextLink :to="listLink">Review all</TextLink>
        </template>

        <div v-if="isLoading && items.length === 0" class="flex flex-col gap-2">
            <Skeleton v-for="n in VISIBLE_REQUESTS" :key="n" class="w-full" />
        </div>
        <ErrorText v-else-if="error" :error="apiErrorMessage(error)" class="mb-0! text-left" />
        <p v-else-if="items.length === 0" class="text-text-muted text-sm">
            No reservations are waiting for approval.
        </p>
        <ul v-else class="divide-border divide-y">
            <DashboardReservationRow
                v-for="item in items"
                :key="item.reservationInfo.id"
                :item
                :now
            >
                <p class="text-text-muted truncate text-xs">
                    Booked by {{ formatUserName(item.reservationInfo.createdBy.by) }}
                </p>
            </DashboardReservationRow>
        </ul>
    </DashboardSection>
</template>
