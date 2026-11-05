<script setup lang="ts">
import { CheckIcon } from "@heroicons/vue/16/solid";
import { DARK_CLOSED_HOURS_BACKGROUND } from "@/features/rooms/utils/calendarStyles";
import Logo from "@/features/shared/Logo.vue";
import BookingBoardPreview from "./BookingBoardPreview.vue";

const { steps = [], currentStep = 0 } = defineProps<{
    title: string;
    description?: string;
    steps?: readonly string[];
    currentStep?: number;
}>();

defineSlots<{
    default(): unknown;
    description?(): unknown;
    footer?(): unknown;
}>();

function stepState(index: number): "done" | "current" | "upcoming" {
    if (index + 1 < currentStep) return "done";
    if (index + 1 === currentStep) return "current";
    return "upcoming";
}

const STEP_BADGE_CLASSES = {
    done: "bg-success text-surface",
    current: "bg-primary text-text-secondary",
    upcoming: "border-border text-text-muted border bg-surface",
} as const;
</script>

<template>
    <div class="flex min-h-screen flex-col lg:flex-row">
        <aside
            class="bg-secondary hidden flex-col gap-10 px-10 py-8 lg:flex lg:w-[46%] xl:w-1/2 xl:px-16"
        >
            <Logo />
            <div class="mx-auto flex w-full max-w-130 grow flex-col justify-center">
                <BookingBoardPreview />
            </div>
        </aside>

        <header
            class="bg-secondary shrink-0 px-4 pt-3 pb-20 sm:px-8 lg:hidden"
            :style="{ backgroundImage: DARK_CLOSED_HOURS_BACKGROUND }"
        >
            <Logo />
        </header>

        <main class="flex grow flex-col items-center px-4 pb-10 sm:px-8 lg:justify-center lg:py-10">
            <div class="relative -mt-14 flex w-full max-w-100 flex-col lg:mt-0">
                <div class="border-border bg-surface rounded-md border p-6 shadow sm:p-8">
                    <ol
                        v-if="steps.length > 0"
                        class="mb-6 flex items-center gap-2"
                        aria-label="Account setup"
                    >
                        <li
                            v-for="(label, index) in steps"
                            :key="label"
                            class="flex min-w-0 items-center gap-2"
                            :class="{ 'flex-1': index < steps.length - 1 }"
                            :aria-current="stepState(index) === 'current' ? 'step' : undefined"
                        >
                            <span
                                class="grid size-5 shrink-0 place-items-center rounded-full text-xs font-bold"
                                :class="STEP_BADGE_CLASSES[stepState(index)]"
                            >
                                <CheckIcon v-if="stepState(index) === 'done'" class="size-3.5" />
                                <template v-else>{{ index + 1 }}</template>
                            </span>
                            <span
                                class="truncate text-xs font-medium"
                                :class="
                                    stepState(index) === 'current' ? 'text-text' : 'text-text-muted'
                                "
                            >
                                {{ label }}
                            </span>
                            <span
                                v-if="index < steps.length - 1"
                                class="h-px min-w-4 flex-1"
                                :class="stepState(index) === 'done' ? 'bg-success' : 'bg-border'"
                            ></span>
                        </li>
                    </ol>

                    <header class="mb-6">
                        <h1 class="text-xl font-semibold">{{ title }}</h1>
                        <p
                            v-if="$slots.description || description"
                            class="text-text-muted mt-1 text-sm"
                        >
                            <slot name="description">{{ description }}</slot>
                        </p>
                    </header>

                    <slot />
                </div>

                <div v-if="$slots.footer" class="text-text-muted mt-6 text-center text-sm">
                    <slot name="footer" />
                </div>
            </div>
        </main>
    </div>
</template>
