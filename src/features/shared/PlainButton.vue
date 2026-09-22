<script setup lang="ts">
import { computed } from "vue";
import Spinner from "./Spinner.vue";

const emits = defineEmits<{
    click: [];
}>();
const { isLoading, disabled } = defineProps<{
    isLoading?: boolean;
    disabled?: boolean;
}>();

const isDisabled = computed(() => isLoading || disabled);
</script>

<template>
    <button
        :disabled="isDisabled"
        class="text-primary flex items-center gap-1 text-sm hover:text-primary-hover hover:underline cursor-pointer rounded outline-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-all disabled:opacity-75"
        @click="emits('click')"
    >
        <Spinner v-if="isLoading" />
        <slot />
    </button>
</template>
