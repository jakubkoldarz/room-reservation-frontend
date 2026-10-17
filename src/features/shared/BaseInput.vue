<script setup lang="ts" generic="T extends string | number">
import { useId } from 'vue'
defineOptions({ inheritAttrs: false })

const slots = defineSlots<{
  icon?(): any
}>()

const props = defineProps<{
  label?: string
  floatingLabel?: boolean
  errorMessage?: string
  type?: string
  placeholder?: string
  isSlim?: boolean
  hasIcon?: boolean
  isRequired?: boolean
}>()

const emit = defineEmits<{
  focus: []
}>()

const model = defineModel<T | null>()
const inputId = useId()
const errorId = `${inputId}-error`
</script>

<template>
  <div class="group flex flex-col gap-1">
    <label v-if="!floatingLabel && label" :for="inputId" class="text-sm font-semibold">
      <span>
        {{ label }}
      </span>
      <span v-if="isRequired" class="text-danger"> * </span>
    </label>
    <div class="relative">
      <div
        class="text-border group-focus-within:text-primary pointer-events-none absolute top-1/2 left-2 size-5 translate-y-[-50%]"
      >
        <slot name="icon" />
      </div>
      <input
        :id="inputId"
        v-model="model"
        v-bind="$attrs"
        :type="type ?? 'text'"
        :placeholder="placeholder ?? ' '"
        :aria-invalid="!!errorMessage"
        :aria-describedby="errorMessage ? errorId : undefined"
        @focus="emit('focus')"
        spellcheck="false"
        class="peer text-text focus-visible:ring-primary w-full rounded border px-2 outline-none focus-visible:ring-2"
        :class="[
          errorMessage ? 'border-danger' : 'border-border',
          isSlim ? 'py-1 text-sm' : 'py-1',
          hasIcon ? 'pl-8' : '',
        ]"
      />

      <label
        v-if="floatingLabel && label"
        :for="inputId"
        class="text-text-muted bg-surface pointer-events-none absolute top-0 -translate-y-1/2 px-1 text-xs font-medium transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:px-0 peer-placeholder-shown:text-sm placeholder-shown:text-xs"
        :class="[
          hasIcon ? 'left-7 peer-placeholder-shown:left-8' : 'left-2 peer-placeholder-shown:left-2',
        ]"
      >
        {{ label }}
      </label>
    </div>

    <p v-if="errorMessage" :id="errorId" class="text-danger text-sm">
      {{ errorMessage }}
    </p>
  </div>
</template>
