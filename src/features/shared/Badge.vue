<script setup lang="ts">
const props = defineProps<{
    text?: string;
}>();
</script>

<template>
    <div class="bg-primary/10 border px-4 py-0.5 border-primary/20 text-primary text-xs rounded text-center font-bold">
        {{ text }}
    </div>
</template>
