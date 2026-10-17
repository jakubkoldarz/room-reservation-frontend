<script setup lang="ts">
import BaseInput from '@/features/shared/BaseInput.vue'
import type { Filter, FilterValues } from '../types'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'

const props = withDefaults(
  defineProps<{
    filters: readonly Filter[]
  }>(),
  {
    filters: () => [],
  },
)

const model = defineModel<FilterValues<typeof props.filters>>({ default: () => ({}) })
</script>

<template>
  <div class="flex w-full flex-wrap gap-2">
    <div v-for="filter in props.filters" :key="filter.key" class="flex w-full flex-col gap-2">
      <BaseInput
        v-if="filter.type === 'text'"
        type="text"
        :label="filter.placeholder"
        floating-label
        has-icon
        v-model="model[filter.key]"
      >
        <template #icon> <MagnifyingGlassIcon /> </template>
      </BaseInput>
    </div>
  </div>
</template>
