<script setup lang="ts">
import Aside from "@/features/shared/Aside.vue";
import Navbar from "@/features/shared/Navbar.vue";
import { ref } from "vue";

const isMobileAsideOpen = ref(false);
</script>

<template>
    <section class="grow flex flex-col">
        <Navbar @mobile-burger-click="isMobileAsideOpen = !isMobileAsideOpen" />
        <div class="grow flex">
            <Aside :is-mobile-aside-open="isMobileAsideOpen" @force-close="isMobileAsideOpen = false" />
            <main class="p-4 w-full">
                <slot />
            </main>
        </div>
    </section>
</template>
