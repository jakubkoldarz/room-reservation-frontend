<script setup lang="ts">
import type { Availability } from "../types";
import BaseContainer from "@/features/shared/BaseContainer.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
import AvailabilitiesList from "./AvailabilitiesList.vue";

const props = defineProps<{
    isLoading?: boolean;
    title: string;
    items?: Availability[];
    hasEditPermission?: boolean;
}>();

const emit = defineEmits<{
    edit: [];
}>();
</script>

<template>
    <BaseContainer class="@container">
        <div class="flex">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <div class="grow"></div>
            <PlainButton @click="emit('edit')" v-if="hasEditPermission">Edit</PlainButton>
        </div>
        <hr class="border-border mt-2 mb-4" />
        <AvailabilitiesList :items="props.items" :is-loading="isLoading" />
    </BaseContainer>
</template>
