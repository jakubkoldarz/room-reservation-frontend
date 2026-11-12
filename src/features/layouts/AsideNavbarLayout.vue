<script setup lang="ts">
import AppNavbar from "@/features/shared/AppNavbar.vue";
import { ref, useTemplateRef, watch } from "vue";
import { useRoute } from "vue-router";
import AsidePanel from "../shared/AsidePanel.vue";

const route = useRoute();
const isMobileAsideOpen = ref(false);
const content = useTemplateRef("content");

watch(
    () => route.path,
    () => content.value?.scrollTo({ top: 0 }),
    { flush: "post" },
);
</script>

<template>
    <section class="flex h-dvh flex-col overflow-hidden">
        <AppNavbar class="shrink-0" @mobile-burger-click="isMobileAsideOpen = !isMobileAsideOpen" />
        <div class="flex min-h-0 grow">
            <AsidePanel
                :is-mobile-aside-open="isMobileAsideOpen"
                @force-close="isMobileAsideOpen = false"
            />
            <main ref="content" class="min-w-0 grow overflow-y-auto p-4">
                <RouterView />
            </main>
        </div>
    </section>
</template>
