<script setup lang="ts">
import { useId } from 'vue'

defineOptions({ inheritAttrs: false })

const checked = defineModel<boolean>()
const id = useId()

const props = defineProps<{
  label?: string
}>()
</script>

<template>
  <label :for="id" class="flex items-center gap-2">
    <input :id="id" v-bind="$attrs" type="checkbox" v-model="checked" class="peer sr-only" />

    <p v-if="props.label" class="text-text-muted text-sm select-none">{{ props.label }}</p>

    <div
      class="border-border peer-focus-visible:ring-primary relative h-4 w-8 cursor-pointer rounded-full border bg-zinc-100 transition-all peer-focus-visible:ring-2 peer-focus-visible:ring-offset-1"
    >
      <span
        :class="[
          checked ? 'bg-success translate-x-4' : 'bg-text-muted/50 translate-x-0',
          'absolute top-1/2 left-px size-3 -translate-y-1/2 rounded-full bg-red-500 transition-all',
        ]"
      ></span>
      <span class=""></span>
    </div>
  </label>
</template>
