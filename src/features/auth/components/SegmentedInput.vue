<script setup lang="ts">
import { ref, watch } from "vue";

const { segments } = defineProps<{
    segments: number;
}>();

const codeModel = defineModel<string>({ required: true });

const digits = ref<string[]>(Array(segments).fill(""));
const inputRefs = ref<HTMLInputElement[]>([]);

watch(digits, () => (codeModel.value = digits.value.join("")), { deep: true });

function onInput(index: number, event: InputEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, "").slice(-1);
    digits.value[index] = value;
    if (value) moveFocus(index + 1);
}

function clearInput(index: number) {
    digits.value[index] = "";
    moveFocus(index - 1);
}

function onPaste(event: ClipboardEvent) {
    const clipboardText = event.clipboardData?.getData("text");
    if (!clipboardText) return;
    const pasted = clipboardText.replace(/[^0-9]/g, "") ?? "";
    pasted.split("").forEach((char, index) => {
        digits.value[index] = char;
    });

    inputRefs.value[inputRefs.value.length - 1].focus();
}

function moveFocus(toIndex: number) {
    if (toIndex < segments && toIndex >= 0) {
        const nextInput = inputRefs.value[toIndex];
        nextInput.focus();
    }
}
</script>

<template>
    <input
        v-for="(_, index) in Array(segments)"
        :key="index"
        ref="inputRefs"
        :value="digits[index]"
        inputmode="numeric"
        maxlength="1"
        @keydown.right="moveFocus(index + 1)"
        @keydown.left="moveFocus(index - 1)"
        @paste.prevent="onPaste($event)"
        @input="onInput(index, $event)"
        @keydown.prevent.backspace="clearInput(index)"
        type="number"
        class="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none border text-center border-border rounded px-1 py-2 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
    />
</template>
