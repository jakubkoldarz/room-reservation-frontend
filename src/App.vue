<script setup lang="ts">
import ToastsWraper from "./features/toasts/components/ToastsWraper.vue";
</script>

<template>
    <div class="bg-background min-h-screen flex flex-col font-sans">
        <router-view />
        <toasts-wraper />
    </div>
</template>
