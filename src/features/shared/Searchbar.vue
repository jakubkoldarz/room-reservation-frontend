<script setup lang="ts">
import { MagnifyingGlassIcon } from '@heroicons/vue/24/solid'
import { ref, useId } from 'vue'

const model = defineModel<string>()
const inputId = useId()
const inputRef = ref<HTMLInputElement>()

const props = defineProps<{
  placeholder?: string
}>()

defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>

<template>
  <div class="relative">
    <div
      class="text-text-muted-secondary group-focus-within:text-primary absolute top-1/2 left-2 size-5 translate-y-[-50%]"
    >
      <MagnifyingGlassIcon />
    </div>
    <input
      :id="inputId"
      v-model="model"
      v-bind="$attrs"
      type="text"
      ref="inputRef"
      :placeholder="placeholder"
      spellcheck="false"
      class="peer focus-visible:ring-primary placeholder:text-text-muted-secondary w-full rounded-md border px-1 py-1 pl-8 text-sm outline-none focus-visible:ring-2"
    />
  </div>
</template>
