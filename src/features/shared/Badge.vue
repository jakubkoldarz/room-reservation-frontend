<script setup lang="ts">
import type { BadgeType } from "@/types/badge-type";

const props = defineProps<{
    text?: string;
    type?: BadgeType;
}>();

const colorClasses: Record<BadgeType, string> = {
    default: "bg-primary/10 border-primary/20 text-primary",
    error: "bg-danger/10 border-danger/20 text-danger",
    success: "bg-success/10 border-success/30 text-success",
    warning: "bg-warning/10 border-warning/30 text-warning-text",
};
</script>

<template>
    <div
        :class="[
            colorClasses[type ?? 'default'],
            'border px-4 py-0.5 text-xs rounded text-center font-bold flex items-center',
        ]"
    >
        {{ text }}
    </div>
</template>
