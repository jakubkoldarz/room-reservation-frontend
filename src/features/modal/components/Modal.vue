<script setup lang="ts">
import Overlay from '@/features/modal/components/Overlay.vue'
import BaseButton from '@/features/shared/BaseButton.vue'
import Container from '@/features/shared/Container.vue'
import PlainButton from '@/features/shared/PlainButton.vue'
const props = withDefaults(
  defineProps<{
    isOpen?: boolean
  }>(),
  {
    isOpen: false,
  },
)

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Overlay :is-open="isOpen" @close="emit('close')">
    <div
      :class="[isOpen ? 'flex' : 'hidden']"
      class="fixed inset-0 z-1000 items-end justify-center p-4 sm:items-center"
    >
      <Container
        :class="[
          isOpen ? 'block scale-100 opacity-100' : 'hidden',
          'transition-all transition-discrete duration-200 ease-out starting:scale-0 starting:opacity-0',
        ]"
        class="w-full sm:max-w-150"
      >
        <h2 class="text-center text-lg font-semibold sm:text-left">Modal Title</h2>
        <hr class="border-border my-2" />
        <p class="py-2">
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Similique rem vel at voluptates,
          cupiditate fugit dolor provident libero et quod.
        </p>
        <hr class="border-border my-2" />
        <div class="flex flex-col justify-end gap-2 sm:mt-4 sm:flex-row sm:gap-4">
          <BaseButton class="justify-center">Delete</BaseButton>
          <PlainButton class="justify-center" @click="emit('close')">Close</PlainButton>
        </div>
      </Container>
    </div>
  </Overlay>
</template>
