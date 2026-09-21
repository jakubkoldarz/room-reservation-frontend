<script setup lang="ts">
import AsideNavbarLayout from "@/features/layouts/AsideNavbarLayout.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const buildingId = computed(() => route.params.buildingId);
</script>

<template>
    <AsideNavbarLayout> widok pojedynczego budynku: {{ buildingId }} </AsideNavbarLayout>
</template>
