<script setup lang="ts">
import { dashboardRoutes } from "@/features/dashboard/routes";

defineProps<{
    code: string;
    title: string;
    message: string;
}>();

const dashboardLink = { name: dashboardRoutes.dashboard.name };
</script>

<template>
    <div class="mx-auto mt-6 w-full max-w-lg sm:mt-16">
        <div class="border-border bg-surface overflow-hidden rounded-md border shadow">
            <div class="bg-secondary px-6 py-8">
                <p class="text-text-secondary text-5xl font-semibold tabular-nums">{{ code }}</p>
            </div>
            <div class="flex flex-col items-start gap-2 p-6">
                <h1 class="text-xl font-semibold">{{ title }}</h1>
                <p class="text-text-muted text-sm">{{ message }}</p>
                <RouterLink
                    :to="dashboardLink"
                    class="bg-primary text-surface hover:bg-primary-hover focus-visible:ring-primary mt-4 rounded px-4 py-1.5 text-sm outline-0 transition-all focus-visible:ring-2 focus-visible:ring-offset-1"
                >
                    Back to dashboard
                </RouterLink>
            </div>
        </div>
    </div>
</template>
