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
        class="bg-transparent flex items-center gap-1 text-text/80 rounded px-4 py-1 text-sm hover:bg-text/10 cursor-pointer outline-0 border border-text/20 focus-visible:ring-2 focus-visible:ring-primary not-disabled:active:scale-[98%] focus-visible:ring-offset-1 transition-all disabled:opacity-75"
        @click="emits('click')"
    >
        <Spinner v-if="isLoading" />
        <slot />
    </button>
</template>
