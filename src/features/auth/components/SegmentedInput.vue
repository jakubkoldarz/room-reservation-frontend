<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const {
    segments,
    label = "Verification code",
    disabled = false,
    invalid = false,
    autofocus = false,
} = defineProps<{
    segments: number;
    label?: string;
    disabled?: boolean;
    invalid?: boolean;
    autofocus?: boolean;
}>();

const emit = defineEmits<{
    complete: [code: string];
}>();

const codeModel = defineModel<string>({ required: true });

const digits = ref<string[]>(toDigits(codeModel.value));
const inputRefs = ref<HTMLInputElement[]>([]);

function toDigits(code: string): string[] {
    const clean = code.replace(/\D/g, "").slice(0, segments);
    return Array.from({ length: segments }, (_, index) => clean[index] ?? "");
}

watch(codeModel, (code) => {
    if (code !== digits.value.join("")) digits.value = toDigits(code);
});

function commit(): void {
    const code = digits.value.join("");
    codeModel.value = code;
    if (code.length === segments) emit("complete", code);
}

function focusAt(index: number): void {
    const clamped = Math.min(Math.max(index, 0), segments - 1);
    inputRefs.value[clamped]?.focus();
    inputRefs.value[clamped]?.select();
}

function fillFrom(start: number, text: string): void {
    const chars = text
        .replace(/\D/g, "")
        .slice(0, segments - start)
        .split("");
    chars.forEach((char, offset) => {
        digits.value[start + offset] = char;
    });
    focusAt(start + chars.length);
    commit();
}

function onInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, "");

    if (value.length > 1) {
        fillFrom(index, value);
        input.value = digits.value[index] ?? "";
        return;
    }

    digits.value[index] = value;
    input.value = value;
    if (value) focusAt(index + 1);
    commit();
}

function onPaste(index: number, event: ClipboardEvent): void {
    const pasted = (event.clipboardData?.getData("text") ?? "").replace(/\D/g, "");
    if (!pasted) return;
    fillFrom(pasted.length >= segments ? 0 : index, pasted);
}

function onBackspace(index: number): void {
    if (digits.value[index]) {
        digits.value[index] = "";
    } else if (index > 0) {
        digits.value[index - 1] = "";
        focusAt(index - 1);
    }
    commit();
}

function onKeydown(index: number, event: KeyboardEvent): void {
    switch (event.key) {
        case "Backspace":
            event.preventDefault();
            onBackspace(index);
            break;
        case "ArrowLeft":
            event.preventDefault();
            focusAt(index - 1);
            break;
        case "ArrowRight":
            event.preventDefault();
            focusAt(index + 1);
            break;
    }
}

function focus(): void {
    const firstEmpty = digits.value.findIndex((digit) => digit === "");
    focusAt(firstEmpty === -1 ? segments - 1 : firstEmpty);
}

onMounted(() => {
    if (autofocus) focus();
});

defineExpose({ focus });
</script>

<template>
    <div
        role="group"
        :aria-label="label"
        class="grid gap-2"
        :style="{ gridTemplateColumns: `repeat(${segments}, minmax(0, 1fr))` }"
    >
        <input
            v-for="index in segments"
            :key="index"
            ref="inputRefs"
            :value="digits[index - 1]"
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            :autocomplete="index === 1 ? 'one-time-code' : 'off'"
            :aria-label="`${label}, digit ${index} of ${segments}`"
            :aria-invalid="invalid"
            :disabled
            class="focus-visible:ring-primary text-text h-12 w-full rounded border text-center text-lg font-semibold tabular-nums outline-none focus-visible:ring-2 disabled:opacity-60"
            :class="invalid ? 'border-danger' : 'border-border'"
            @input="onInput(index - 1, $event)"
            @paste.prevent="onPaste(index - 1, $event)"
            @keydown="onKeydown(index - 1, $event)"
            @focus="($event.target as HTMLInputElement).select()"
        />
    </div>
</template>
