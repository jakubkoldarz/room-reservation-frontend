<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import type { FunctionalComponent } from "vue";
import type { Toast, ToastType } from "../types";
import {
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon,
} from "@heroicons/vue/24/solid";
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

const toastsStore = useToastsStore();

onMounted(() => {
    source.value = 0;
});

watch(
    () => progress.value,
    () => {
        if (progress.value === 0) toastsStore.remove(props.toast.id);
    },
);
</script>

<template>
    <div
        :class="[
            currentTheme.borderClass,
            'bg-surface w-full overflow-hidden rounded-lg border shadow-md',
        ]"
    >
        <div class="flex items-start gap-2 p-3">
            <div :class="[currentTheme.iconClass, 'flex shrink-0 items-center justify-center']">
                <component :is="currentTheme.icon" class="size-5" />
            </div>
            <div class="flex min-w-0 grow flex-col">
                <p v-if="toast.title" class="text-sm font-semibold">{{ toast.title }}</p>
                <p class="text-sm break-words">{{ toast.message }}</p>
            </div>
            <button
                type="button"
                aria-label="Close notification"
                class="text-text-muted hover:text-text focus-visible:ring-primary -m-1 shrink-0 cursor-pointer rounded p-1 outline-none focus-visible:ring-2"
                @click="toastsStore.remove(toast.id)"
            >
                <XMarkIcon class="size-4" />
            </button>
        </div>
        <div
            :class="[currentTheme.progressClass, 'h-2 w-full']"
            :style="`max-width: ${progress * 100}%`"
        ></div>
    </div>
</template>
