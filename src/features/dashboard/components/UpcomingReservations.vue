<script setup lang="ts">
import { profileRoutes } from "@/features/profile/routes";
import ReservationStatusChip from "@/features/reservations/components/ReservationStatusChip.vue";
import type { ReservationListItem } from "@/features/reservations/types";
import { getReservationState } from "@/features/reservations/utils/reservationState";
import ErrorText from "@/features/shared/ErrorText.vue";
import Skeleton from "@/features/shared/Skeleton.vue";
import TextLink from "@/features/shared/TextLink.vue";
import DashboardReservationRow from "./DashboardReservationRow.vue";
import DashboardSection from "./DashboardSection.vue";

defineProps<{
    items: readonly ReservationListItem[];
    isLoading: boolean;
    error: string | null;
    now: Date;
}>();

const allLink = { name: profileRoutes.view.name, query: { tab: "reservations" } };

function stateOf(item: ReservationListItem) {
    return getReservationState(item.reservationInfo, item.roomInfo.requiresApproval);
}
</script>

<template>
    <DashboardSection title="My upcoming reservations">
        <template #action>
            <TextLink :to="allLink">View all</TextLink>
        </template>

        <div v-if="isLoading && items.length === 0" class="flex flex-col gap-2">
            <Skeleton v-for="n in 3" :key="n" class="w-full" />
        </div>
        <ErrorText v-else-if="error" :error class="mb-0! text-left" />
        <p v-else-if="items.length === 0" class="text-text-muted text-sm">
            No upcoming reservations.
        </p>
        <ul v-else class="divide-border divide-y">
            <DashboardReservationRow
                v-for="item in items"
                :key="item.reservationInfo.id"
                :item
                :now
            >
                <template #status>
                    <ReservationStatusChip :state="stateOf(item)" />
                </template>
                <p v-if="item.reservationInfo.purpose" class="text-text-muted truncate text-xs">
                    {{ item.reservationInfo.purpose }}
                </p>
            </DashboardReservationRow>
        </ul>
    </DashboardSection>
</template>
