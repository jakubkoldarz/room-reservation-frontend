<script setup lang="ts">
import { computed } from 'vue'
import Spinner from './Spinner.vue'

const emits = defineEmits<{
  click: []
}>()
const { isLoading, disabled } = defineProps<{
  isLoading?: boolean
  disabled?: boolean
}>()

const isDisabled = computed(() => isLoading || disabled)
</script>

<template>
  <button
    :disabled="isDisabled"
    class="text-text hover:bg-text/10 border-text/20 focus-visible:ring-primary flex cursor-pointer items-center gap-1 rounded border bg-transparent px-4 py-1 text-sm outline-0 transition-all focus-visible:ring-2 focus-visible:ring-offset-1 not-disabled:active:scale-[98%] disabled:opacity-75"
    @click="emits('click')"
  >
    <Spinner v-if="isLoading" />
    <slot />
  </button>
</template>
