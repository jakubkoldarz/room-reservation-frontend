<script setup lang="ts">
const emit = defineEmits<{
    click: [];
}>();
</script>

<template>
    <button
        @click="emit('click')"
        v-bind="$attrs"
        class="cursor-pointer outline-none ring-offset-transparent rounded-full focus-within:ring-1 ring-offset-1 ring-primary hover:text-primary"
    >
        <slot />
    </button>
</template>
