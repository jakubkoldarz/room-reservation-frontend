<script setup lang="ts">
import ToastsWraper from './features/toasts/components/ToastsWraper.vue'
</script>

<template>
  <div class="bg-background flex min-h-screen flex-col font-sans">
    <router-view />
    <toasts-wraper />
  </div>
</template>
