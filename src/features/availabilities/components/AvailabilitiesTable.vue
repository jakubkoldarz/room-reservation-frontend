<script setup lang="ts">
import type { Availability } from "@/types/availabilities";
import Container from "@/features/shared/Container.vue";
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
    <Container class="@container">
        <div class="flex">
            <h2 class="text-lg font-semibold">{{ title }}</h2>
            <div class="grow"></div>
            <PlainButton @click="emit('edit')" v-if="hasEditPermission">Edit</PlainButton>
        </div>
        <hr class="border-border mb-4 mt-2" />
        <AvailabilitiesList :items="props.items" :is-loading="isLoading" />
    </Container>
</template>
