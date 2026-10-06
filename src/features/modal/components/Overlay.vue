<script setup lang="ts">
const props = withDefaults(
    defineProps<{
        isOpen?: boolean;
    }>(),
    {
        isOpen: false,
    },
);

const emit = defineEmits<{
    close: [];
}>();
</script>

<template>
    <Teleport to="body">
        <div
            @click="emit('close')"
            :class="[
                isOpen ? 'fixed opacity-100' : 'hidden opacity-0',
                'inset-0 z-1000 bg-black/30 backdrop-blur-sm',
                'transition-discrete transition-opacity duration-300 ease-out starting:opacity-0',
            ]"
        ></div>
    </Teleport>
</template>
