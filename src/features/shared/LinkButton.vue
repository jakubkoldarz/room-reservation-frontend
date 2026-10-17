<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    active?: boolean | undefined
    to: RouteLocationRaw
  }>(),
  {
    active: undefined,
  },
)
</script>

<template>
  <RouterLink :to="to" custom v-slot="{ isActive, href, navigate }">
    <a
      :href="href"
      @click="navigate"
      :aria-current="(active ?? isActive) ? 'page' : undefined"
      :class="[
        'ring-primary flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm ring-offset-2 transition-all duration-75 outline-none focus-visible:ring-2 [&_svg]:size-4 [&_svg]:shrink-0',
        (active ?? isActive)
          ? 'bg-primary/10 text-primary border-primary/20 font-medium'
          : 'bg-text-muted/10 text-text-muted border-text-muted/20 hover:border-primary/40 hover:text-primary hover:bg-primary/10',
      ]"
    >
      <slot />
    </a>
  </RouterLink>
</template>
