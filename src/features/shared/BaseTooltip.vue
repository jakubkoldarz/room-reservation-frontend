<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, useTemplateRef } from "vue";
import { onClickOutside, useEventListener } from "@vueuse/core";

defineOptions({ inheritAttrs: false });

const { text, delay = 80 } = defineProps<{
    text: string;
    delay?: number;
}>();

const GAP = 8;
const VIEWPORT_MARGIN = 8;
const TOUCH_VISIBLE_MS = 3000;

const id = useId();
const trigger = useTemplateRef("trigger");
const bubble = useTemplateRef("bubble");

const isVisible = ref(false);
const isPositioned = ref(false);
const placement = ref<"top" | "bottom">("top");
const top = ref(0);
const left = ref(0);
const arrowLeft = ref(0);
let timer: number | undefined;
let autoHideTimer: number | undefined;

function clearTimers(): void {
    window.clearTimeout(timer);
    window.clearTimeout(autoHideTimer);
}

function show(after = delay): void {
    clearTimers();
    timer = window.setTimeout(async () => {
        isVisible.value = true;
        isPositioned.value = false;
        await nextTick();
        updatePosition();
    }, after);
}

function hide(): void {
    clearTimers();
    isVisible.value = false;
}

function onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === "mouse") show();
}

function onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === "mouse") hide();
}

function onTap(event: PointerEvent): void {
    if (event.pointerType === "mouse") return;
    if (isVisible.value) return hide();
    show(0);
    autoHideTimer = window.setTimeout(hide, TOUCH_VISIBLE_MS);
}

function updatePosition(): void {
    const anchor = trigger.value?.getBoundingClientRect();
    const tip = bubble.value?.getBoundingClientRect();
    if (!anchor || !tip) return;

    const fitsAbove = anchor.top - tip.height - GAP >= VIEWPORT_MARGIN;
    placement.value = fitsAbove ? "top" : "bottom";
    top.value = fitsAbove ? anchor.top - tip.height - GAP : anchor.bottom + GAP;

    const anchorCenter = anchor.left + anchor.width / 2;
    const maxLeft = window.innerWidth - tip.width - VIEWPORT_MARGIN;
    left.value = Math.min(Math.max(anchorCenter - tip.width / 2, VIEWPORT_MARGIN), maxLeft);
    arrowLeft.value = anchorCenter - left.value;
    isPositioned.value = true;
}

onClickOutside(trigger, hide);
useEventListener(window, "scroll", hide, { capture: true, passive: true });
useEventListener(window, "resize", hide, { passive: true });
useEventListener(window, "keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") hide();
});

onBeforeUnmount(clearTimers);
</script>

<template>
    <span
        ref="trigger"
        v-bind="$attrs"
        class="inline-flex"
        :aria-describedby="isVisible ? id : undefined"
        @pointerenter="onPointerEnter"
        @pointerleave="onPointerLeave"
        @pointerup="onTap"
        @focusin="show()"
        @focusout="hide"
    >
        <slot />
    </span>
    <Teleport to="body">
        <span
            v-if="isVisible"
            :id
            ref="bubble"
            role="tooltip"
            class="bg-secondary text-text-secondary pointer-events-none fixed z-1100 max-w-64 rounded-md px-2 py-1 text-xs font-medium shadow-lg transition-opacity duration-100"
            :class="isPositioned ? 'opacity-100' : 'opacity-0'"
            :style="{ top: `${top}px`, left: `${left}px` }"
        >
            {{ text }}
            <span
                class="bg-secondary absolute size-2 -translate-x-1/2 rotate-45"
                :class="placement === 'top' ? '-bottom-1' : '-top-1'"
                :style="{ left: `${arrowLeft}px` }"
            ></span>
        </span>
    </Teleport>
</template>
