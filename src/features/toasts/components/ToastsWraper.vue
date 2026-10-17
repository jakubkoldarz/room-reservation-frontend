<script setup lang="ts">
import { useToastsStore } from '../stores/useToastsStore'
import Toast from './Toast.vue'

const toastsStore = useToastsStore()
</script>

<template>
  <div class="pointer-events-none fixed top-4 right-4 z-1500 flex w-full max-w-sm flex-col">
    <TransitionGroup name="toasts" tag="ul" class="relative flex w-full flex-col gap-2">
      <li v-for="toast in toastsStore.toasts" :key="toast.id" class="pointer-events-auto w-full">
        <Toast :toast="toast" />
      </li>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts-enter-active,
.toasts-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toasts-move {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.toasts-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toasts-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.95);
}

.toasts-leave-active {
  position: absolute;
  width: 100%;
}
</style>
