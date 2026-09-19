<script setup lang="ts">
import Aside from "@/features/shared/Aside.vue";
import Navbar from "@/features/shared/Navbar.vue";
</script>

<template>
    <section class="min-h-screen flex flex-col">
        <Navbar />
        <div class="flex flex-1">
            <Aside />
            <main class="p-4">Widok budynków</main>
        </div>
    </section>
</template>
