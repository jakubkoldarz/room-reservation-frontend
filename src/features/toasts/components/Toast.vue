<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type { FunctionalComponent } from "vue";
import type { Toast, ToastType } from "../types/toast";
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from "@heroicons/vue/24/solid";
import { useTransition } from "@vueuse/core";
import { useToastsStore } from "../stores/useToastsStore";

const source = ref(1);
const progress = useTransition(source, {
    duration: 3500,
});

interface ToastStyleConfig {
    icon: FunctionalComponent;
    borderClass: string;
    iconClass: string;
    progressClass: string;
}

const TOAST_THEMES: Record<ToastType, ToastStyleConfig> = {
    success: {
        icon: CheckCircleIcon,
        borderClass: "border-success",
        iconClass: "text-success",
        progressClass: "bg-success",
    },
    error: {
        icon: XCircleIcon,
        borderClass: "border-danger",
        iconClass: "text-danger",
        progressClass: "bg-danger",
    },
    info: {
        icon: InformationCircleIcon,
        borderClass: "border-primary",
        iconClass: "text-primary",
        progressClass: "bg-primary",
    },
    warning: {
        icon: ExclamationTriangleIcon,
        borderClass: "border-warning",
        iconClass: "text-warning",
        progressClass: "bg-warning",
    },
};

const props = defineProps<{
    toast: Toast;
}>();

const currentTheme = computed(() => {
    return TOAST_THEMES[props.toast.type] ?? TOAST_THEMES.info;
});

onMounted(() => {
    source.value = 0;
});

watch(
    () => progress.value,
    () => {
        if (progress.value === 0) {
            const toastsStore = useToastsStore();
            toastsStore.remove(props.toast.id);
        }
    },
);
</script>

<template>
    <div :class="[currentTheme.borderClass, 'rounded-lg border bg-surface shadow-md overflow-hidden w-full']">
        <div class="flex gap-2 p-2">
            <div :class="[currentTheme.iconClass, 'shrink-0 flex items-center justify-center']">
                <component :is="currentTheme.icon" class="size-5" />
            </div>
            <div class="flex flex-col">
                <p class="font-semibold text-sm">{{ toast.title }}</p>
                <p class="text-sm">{{ toast.message }}</p>
            </div>
        </div>
        <div :class="[currentTheme.progressClass, 'h-2 w-full']" :style="`max-width: ${progress * 100}%`"></div>
    </div>
</template>
