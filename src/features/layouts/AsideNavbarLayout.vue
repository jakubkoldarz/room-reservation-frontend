<script setup lang="ts">
import Aside from '@/features/shared/Aside.vue'
import Navbar from '@/features/shared/Navbar.vue'
import { ref } from 'vue'

const isMobileAsideOpen = ref(false)
</script>

<template>
  <section class="flex grow flex-col">
    <Navbar @mobile-burger-click="isMobileAsideOpen = !isMobileAsideOpen" />
    <div class="flex grow">
      <Aside :is-mobile-aside-open="isMobileAsideOpen" @force-close="isMobileAsideOpen = false" />
      <main class="w-full p-4">
        <slot />
      </main>
    </div>
  </section>
</template>
