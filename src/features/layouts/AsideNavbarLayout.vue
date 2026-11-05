<script setup lang="ts">
import AppNavbar from "@/features/shared/AppNavbar.vue";
import { ref } from "vue";
import AsidePanel from "../shared/AsidePanel.vue";

const isMobileAsideOpen = ref(false);
</script>

<template>
    <section class="flex grow flex-col">
        <AppNavbar @mobile-burger-click="isMobileAsideOpen = !isMobileAsideOpen" />
        <div class="flex grow">
            <AsidePanel
                :is-mobile-aside-open="isMobileAsideOpen"
                @force-close="isMobileAsideOpen = false"
            />
            <main class="w-full p-4">
                <slot />
            </main>
        </div>
    </section>
</template>
