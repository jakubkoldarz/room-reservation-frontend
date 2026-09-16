<script setup lang="ts">
const { error } = defineProps<{
    error?: string;
}>();
</script>

<template>
    <p class="text-sm text-center mb-2 text-danger" v-if="error">{{ error }}</p>
</template>
