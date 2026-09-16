<script setup lang="ts">
import BaseButton from "@/features/shared/BaseButton.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import SegmentedInput from "../components/SegmentedInput.vue";
const { params } = useRoute();
const veficationId = computed(() => params.veficationId as string);
</script>

<template>
    <section class="grid place-items-center min-h-screen">
        <div class="p-8 flex flex-col items-center gap-2 shadow rounded bg-surface w-full max-w-100">
            <h2 class="text-center">Enter your verification code</h2>
            <div class="flex gap-1 my-2">
                <SegmentedInput :segments="6" />
            </div>
            <BaseButton class="w-24 justify-center" @click="console.log('text')">Verify</BaseButton>
        </div>
    </section>
</template>
