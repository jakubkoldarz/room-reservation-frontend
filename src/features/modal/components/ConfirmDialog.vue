<script setup lang="ts">
import { useId, useTemplateRef, watch } from "vue";
import OutlineButton from "@/features/shared/OutlineButton.vue";
import { useConfirmDialogState } from "../composables/useConfirm";

// Wstaw ten komponent raz, w App.vue. Otwiera się przez useConfirm().
const { pending, answer } = useConfirmDialogState();
const dialog = useTemplateRef("dialog");
const titleId = useId();

// Natywny <dialog> daje za darmo: tło, blokadę strony, Esc i pułapkę fokusu.
watch(pending, (current) => {
    if (current && !dialog.value?.open) dialog.value?.showModal();
    if (!current && dialog.value?.open) dialog.value.close();
});
</script>

<template>
    <!-- @close łapie Esc; @click.self łapie kliknięcie w tło poza okienkiem. -->
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

            <!-- „Anuluj” jest pierwszy w DOM, więc dostaje fokus po otwarciu — bezpieczny wybór
                 przy usuwaniu. Na telefonie przyciski są jeden pod drugim. -->
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
                    @click="answer(true)"
                >
                    {{ pending.options.confirmText ?? "Confirm" }}
                </button>
            </div>
        </div>
    </dialog>
</template>
