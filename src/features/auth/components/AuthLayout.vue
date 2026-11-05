<script setup lang="ts">
import Logo from "@/features/shared/Logo.vue";

const { step, totalSteps } = defineProps<{
    title: string;
    description?: string;
    step?: number;
    totalSteps?: number;
}>();

defineSlots<{
    default(): unknown;
    description?(): unknown;
    footer?(): unknown;
}>();
</script>

<template>
    <main class="flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <Logo on-light class="mb-6" />
        <div
            class="border-border bg-surface w-full max-w-100 rounded-md border p-6 shadow-sm sm:p-8"
        >
            <div v-if="step && totalSteps" class="mb-5">
                <p class="text-text-muted text-xs font-medium tracking-wide uppercase">
                    Step {{ step }} of {{ totalSteps }}
                </p>
                <div class="mt-2 flex gap-1.5" aria-hidden="true">
                    <span
                        v-for="index in totalSteps"
                        :key="index"
                        class="h-1 flex-1 rounded-full"
                        :class="index <= step ? 'bg-primary' : 'bg-border'"
                    />
                </div>
            </div>

            <header class="mb-6">
                <h1 class="text-xl font-semibold">{{ title }}</h1>
                <p v-if="$slots.description || description" class="text-text-muted mt-1 text-sm">
                    <slot name="description">{{ description }}</slot>
                </p>
            </header>

            <slot />
        </div>
        <div v-if="$slots.footer" class="text-text-muted mt-6 text-center text-sm">
            <slot name="footer" />
        </div>
    </main>
</template>
