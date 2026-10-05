<script setup lang="ts">
import Overlay from "@/features/modal/components/Overlay.vue";
import BaseButton from "@/features/shared/BaseButton.vue";
import Container from "@/features/shared/Container.vue";
import PlainButton from "@/features/shared/PlainButton.vue";
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
    <Overlay :is-open="isOpen" @close="emit('close')" />
    <Teleport to="body">
        <div
            :class="[isOpen ? 'flex' : 'hidden']"
            class="fixed z-1000 inset-0 items-end sm:items-center justify-center p-4"
        >
            <Container
                :class="[
                    isOpen ? 'scale-100 opacity-100 block' : 'hidden',
                    'transition-discrete transition-all duration-200 ease-out starting:opacity-0 starting:scale-0',
                ]"
                class="w-full sm:max-w-150"
            >
                <h2 class="text-center sm:text-left font-semibold text-lg">Modal Title</h2>
                <hr class="my-2 border-border" />
                <p class="py-2">
                    Lorem ipsum dolor, sit amet consectetur adipisicing elit. Similique rem vel at voluptates,
                    cupiditate fugit dolor provident libero et quod.
                </p>
                <hr class="my-2 border-border" />
                <div class="flex flex-col gap-2 sm:flex-row justify-end sm:gap-4 sm:mt-4">
                    <BaseButton class="justify-center">Delete</BaseButton>
                    <PlainButton class="justify-center" @click="emit('close')">Close</PlainButton>
                </div>
            </Container>
        </div>
    </Teleport>
</template>
