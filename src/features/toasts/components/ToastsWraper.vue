<script setup lang="ts">
import { useToastsStore } from "../stores/useToastsStore";
import Toast from "./Toast.vue";

const toastsStore = useToastsStore();
</script>

<template>
    <div class="fixed top-4 right-4 z-1500 flex w-full max-w-sm flex-col pointer-events-none">
        <TransitionGroup name="toasts" tag="ul" class="relative flex flex-col gap-2 w-full">
            <li v-for="toast in toastsStore.toasts" :key="toast.id" class="w-full pointer-events-auto">
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
