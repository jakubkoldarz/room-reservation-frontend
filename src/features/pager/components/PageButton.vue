<script setup lang="ts">
import LinkButton from "@/features/shared/LinkButton.vue";
import { useRoute } from "vue-router";

const props = defineProps<{
    disabled?: boolean;
    isActive?: boolean;
    text?: string;
    page: number;
}>();

const route = useRoute();
</script>

<template>
    <LinkButton
        v-if="!disabled"
        :active="isActive"
        class="min-w-8 justify-center rounded! px-2! py-0! select-none"
        :to="{ query: { ...route.query, page } }"
    >
        {{ props.text || props.page }}
    </LinkButton>

    <LinkButton
        v-else
        :active="false"
        class="pointer-events-none min-w-8 cursor-not-allowed justify-center rounded! px-2! py-0! opacity-50 select-none"
        :to="{ query: { page } }"
    >
        {{ props.text || props.page }}
    </LinkButton>
</template>
