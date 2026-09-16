<script setup lang="ts">
import { computed, ref } from "vue";

const { segments } = defineProps<{
    segments: number;
}>();

const digits = ref<string[]>(Array(segments).fill(""));
const inputRefs = ref<HTMLInputElement[]>([]);
const code = computed(() => digits.value.join(""));

function onInput(index: number, event: InputEvent) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, "").slice(-1);
    digits.value[index] = value;

    if (index < segments - 1) {
        const nextInput = inputRefs.value[index + 1];
        nextInput.focus();
    }
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
</script>

<template>
    <input
        v-for="(_, index) in digits"
        :key="index"
        ref="inputRefs"
        v-model="digits[index]"
        inputmode="numeric"
        maxlength="1"
        @paste="onPaste($event)"
        @input="onInput(index, $event)"
        type="number"
        class="border text-center border-border rounded px-1 py-2 w-full outline-none focus-visible:ring-2 focus-visible:ring-primary"
    />
</template>
