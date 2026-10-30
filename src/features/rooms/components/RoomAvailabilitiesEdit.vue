<script setup lang="ts">
import { ref } from "vue";
import { DocumentDuplicateIcon } from "@heroicons/vue/24/solid";
import apiClient from "@/api/client";
import { apiCall } from "@/api/apiCall";
import { apiErrorMessage } from "@/api/errors";
import { usePermissions } from "@/composables/usePermissions";
import { Permission } from "@/features/auth/constants/permissions";
import AvailabilitiesEdit from "@/features/availabilities/components/AvailabilitiesEdit.vue";
import type { Availability } from "@/features/availabilities/types";
import NumberCircle from "@/features/buildings/components/NumberCircle.vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import { useToastsStore } from "@/features/toasts/stores/useToastsStore";

const { buildingId, isLoading = false } = defineProps<{
    buildingId: string;
    isLoading?: boolean;
}>();

const availabilities = defineModel<Availability[]>({ required: true });

const { hasPermission } = usePermissions();
const toasts = useToastsStore();
const isCopying = ref(false);

async function copyFromBuilding(): Promise<void> {
    if (!buildingId || isCopying.value) return;

    isCopying.value = true;
    const result = await apiCall(() =>
        apiClient.getBuildingsBuildingId({ params: { buildingId } }),
    );
    isCopying.value = false;

    if (!result.ok) {
        toasts.pushError({
            title: "Failed to copy availabilities",
            message: apiErrorMessage(result.error),
        });
        return;
    }
    availabilities.value = result.data.availabilities.map(({ dayOfWeek, startTime, endTime }) => ({
        dayOfWeek,
        startTime,
        endTime,
    }));
    toasts.pushInfo({
        title: "Availabilities copied",
        message: `Copied from "${result.data.buildingInfo.name}"`,
    });
}
</script>

<template>
    <AvailabilitiesEdit v-model="availabilities" :is-loading>
        <div class="flex flex-wrap items-center gap-2">
            <NumberCircle>3</NumberCircle>
            <h2 class="text-lg font-semibold">Room availabilities</h2>
            <span class="grow"></span>
            <OutlineButton
                v-if="hasPermission(Permission.BuildingView)"
                :disabled="!buildingId || isLoading"
                :is-loading="isCopying"
                class="border-primary/30! text-primary! hover:bg-primary/10! w-full justify-center rounded-lg py-1 disabled:cursor-not-allowed disabled:opacity-50! disabled:hover:bg-transparent! @sm:w-auto"
                @click="copyFromBuilding"
            >
                <DocumentDuplicateIcon v-if="!isCopying" class="size-4" />
                Copy from building
            </OutlineButton>
        </div>
        <p class="text-text-muted text-sm">
            <slot />
        </p>
        <hr class="border-border my-2" />
    </AvailabilitiesEdit>
</template>
