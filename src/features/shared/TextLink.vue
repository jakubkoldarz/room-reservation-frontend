<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";

defineProps<{
    to: RouteLocationRaw;
}>();
</script>

<template>
    <RouterLink
        :to
        class="text-text hover:text-primary focus-visible:ring-primary rounded-sm font-medium underline-offset-2 transition-colors outline-none hover:underline focus-visible:ring-2"
    >
        <slot />
    </RouterLink>
</template>
