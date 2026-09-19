<script setup lang="ts">
const emit = defineEmits<{
    click: [];
}>();
</script>

<template>
    <button @click="emit('click')" v-bind="$attrs" class="cursor-pointer hover:text-primary">
        <slot />
    </button>
</template>
