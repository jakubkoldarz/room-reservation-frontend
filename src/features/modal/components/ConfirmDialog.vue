<script setup lang="ts">
import { ExclamationTriangleIcon } from "@heroicons/vue/24/solid";
import { ref, useId, useTemplateRef, watch } from "vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import { useConfirmDialogState } from "../composables/useConfirm";

const { pending, answer } = useConfirmDialogState();
const dialog = useTemplateRef("dialog");
const titleId = useId();
const inputId = useId();
const inputValue = ref("");

watch(pending, (current) => {
    inputValue.value = "";
    const element = dialog.value;
    if (!element) return;

    if (current && !element.open) element.showModal();
    if (!current && element.open) element.close();
});
</script>

<template>
    <dialog
        ref="dialog"
        :aria-labelledby="titleId"
        class="bg-surface text-text border-border mx-0 mt-auto mb-0 w-full max-w-none rounded-t-xl border p-0 shadow-lg backdrop:bg-black/30 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-md sm:rounded-xl"
        @close="answer(false)"
        @click.self="answer(false)"
    >
        <div v-if="pending" class="flex flex-col gap-4 p-4 sm:p-6">
            <h2 :id="titleId" class="text-lg font-semibold">{{ pending.options.title }}</h2>
            <p class="text-text-muted text-sm">{{ pending.options.message }}</p>

            <div
                v-if="pending.options.warning"
                role="alert"
                class="border-danger/30 bg-danger/5 text-danger flex gap-3 rounded border border-l-4 px-3 py-2.5 text-sm"
            >
                <ExclamationTriangleIcon class="mt-0.5 size-5 shrink-0" />
                <div class="flex min-w-0 flex-col gap-1.5">
                    <p class="font-semibold">{{ pending.options.warning.title }}</p>
                    <ul class="list-disc space-y-0.5 pl-4">
                        <li v-for="point in pending.options.warning.points" :key="point">
                            {{ point }}
                        </li>
                    </ul>
                    <p v-if="pending.options.warning.note">{{ pending.options.warning.note }}</p>
                </div>
            </div>

            <ul
                v-if="pending.options.items?.length"
                class="border-border divide-border max-h-56 divide-y overflow-y-auto rounded border text-sm"
            >
                <li
                    v-for="(item, index) in pending.options.items"
                    :key="index"
                    class="flex flex-wrap items-baseline justify-between gap-x-3 px-3 py-1.5"
                >
                    <span class="text-text">{{ item.primary }}</span>
                    <span v-if="item.secondary" class="text-text-muted text-xs">
                        {{ item.secondary }}
                    </span>
                </li>
            </ul>

            <div v-if="pending.options.input" class="flex flex-col gap-1">
                <label :for="inputId" class="text-sm font-semibold">
                    {{ pending.options.input.label }}
                </label>
                <textarea
                    :id="inputId"
                    v-model="inputValue"
                    rows="3"
                    :maxlength="pending.options.input.maxLength"
                    class="border-border text-text focus-visible:ring-primary w-full resize-none rounded border px-2 py-1 text-sm outline-none focus-visible:ring-2"
                ></textarea>
                <span
                    v-if="pending.options.input.maxLength"
                    class="text-text-muted self-end text-xs tabular-nums"
                >
                    {{ inputValue.length }}/{{ pending.options.input.maxLength }}
                </span>
            </div>

            <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <OutlineButton class="justify-center py-2 sm:py-1" @click="answer(false)">
                    {{ pending.options.cancelText ?? "Cancel" }}
                </OutlineButton>
                <button
                    type="button"
                    class="text-surface flex cursor-pointer items-center justify-center rounded px-4 py-2 text-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[98%] sm:py-1"
                    :class="
                        pending.options.danger
                            ? 'bg-danger focus-visible:ring-danger hover:opacity-90'
                            : 'bg-primary hover:bg-primary-hover focus-visible:ring-primary'
                    "
                    @click="answer(true, inputValue)"
                >
                    {{ pending.options.confirmText ?? "Confirm" }}
                </button>
            </div>
        </div>
    </dialog>
</template>
