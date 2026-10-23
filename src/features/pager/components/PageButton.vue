<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import LinkButton from "@/features/shared/LinkButton.vue";

const {
    page,
    disabled = false,
    isActive = false,
    label,
} = defineProps<{
    page: number;
    disabled?: boolean;
    isActive?: boolean;
    label?: string;
}>();

defineSlots<{ default?(): unknown }>();

const route = useRoute();
const to = computed(() => ({
    query: { ...route.query, page: page > 1 ? String(page) : undefined },
}));
</script>

<template>
    <span
        v-if="disabled"
        aria-disabled="true"
        class="bg-text-muted/10 text-text-muted border-text-muted/20 flex min-w-8 cursor-not-allowed items-center justify-center rounded border px-2 text-sm opacity-50 select-none"
    >
        <span aria-hidden="true"
            ><slot>{{ page }}</slot></span
        >
        <span v-if="label" class="sr-only">{{ label }}</span>
    </span>

    <LinkButton
        v-else
        :active="isActive"
        :to
        class="min-w-8 justify-center rounded! px-2! py-0! select-none"
    >
        <span class="text-inherit"
            ><slot>{{ page }}</slot></span
        >
        <span v-if="label" class="sr-only">{{ label }}</span>
    </LinkButton>
</template>
