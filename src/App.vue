<script setup lang="ts">
import ConfirmDialog from "./features/modal/components/ConfirmDialog.vue";
import ToastsWraper from "./features/toasts/components/ToastsWraper.vue";
</script>

<template>
    <div class="bg-background flex min-h-screen flex-col font-sans">
        <router-view />
        <toasts-wraper />
        <confirm-dialog />
    </div>
</template>
