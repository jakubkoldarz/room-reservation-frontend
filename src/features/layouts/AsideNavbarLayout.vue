<script setup lang="ts">
import Aside from "@/features/shared/Aside.vue";
import Navbar from "@/features/shared/Navbar.vue";
</script>

<template>
    <section class="grow flex flex-col">
        <Navbar />
        <div class="grow flex">
            <Aside />
            <main class="p-4 w-full">
                <slot />
            </main>
        </div>
    </section>
</template>
