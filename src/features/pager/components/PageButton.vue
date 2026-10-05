<script setup lang="ts">
import LinkButton from "@/features/shared/LinkButton.vue";

const props = defineProps<{
    disabled?: boolean;
    isActive?: boolean;
    text?: string;
    page: number;
}>();
</script>

<template>
    <LinkButton
        v-if="!disabled"
        :active="isActive"
        class="py-0! px-2! rounded! select-none min-w-8 justify-center"
        :to="{ query: { page } }"
    >
        {{ props.text || props.page }}
    </LinkButton>

    <LinkButton
        v-else
        :active="false"
        class="py-0! px-2! rounded! opacity-50 cursor-not-allowed pointer-events-none select-none min-w-8 justify-center"
        :to="{ query: { page } }"
    >
        {{ props.text || props.page }}
    </LinkButton>
</template>
