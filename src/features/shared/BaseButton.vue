<script setup lang="ts">
const emits = defineEmits<{
    click: [];
}>();
</script>

<template>
    <button
        class="bg-primary flex items-center gap-1 text-surface px-4 py-1 text-sm hover:bg-primary-hover cursor-pointer rounded outline-0 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-all"
        @click="emits('click')"
    >
        <slot />
    </button>
</template>
