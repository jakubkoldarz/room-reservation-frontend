<script setup lang="ts">
const { error } = defineProps<{
  error?: string
}>()
</script>

<template>
  <p class="text-danger mb-2 text-center text-sm" v-if="error">{{ error }}</p>
</template>
