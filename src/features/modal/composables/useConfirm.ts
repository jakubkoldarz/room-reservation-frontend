import { readonly, shallowRef } from "vue";
import type { ConfirmOptions, PendingConfirm, PromptOptions } from "../types";

const pending = shallowRef<PendingConfirm | null>(null);

function open(options: ConfirmOptions, resolve: PendingConfirm["resolve"]): void {
    if (pending.value) pending.value.resolve(false, "");
    pending.value = { options, resolve };
}

export function useConfirm() {
    function confirm(options: ConfirmOptions): Promise<boolean> {
        return new Promise((resolve) => {
            open(options, (confirmed) => {
                resolve(confirmed);
            });
        });
    }

    return confirm;
}

export function usePrompt() {
    function prompt(options: PromptOptions): Promise<string | null> {
        return new Promise((resolve) => {
            open(options, (confirmed, value) => {
                if (confirmed) {
                    resolve(value.trim());
                } else {
                    resolve(null);
                }
            });
        });
    }

    return prompt;
}

export function useConfirmDialogState() {
    function answer(confirmed: boolean, value = ""): void {
        const current = pending.value;
        pending.value = null;
        if (current) current.resolve(confirmed, value);
    }

    return { pending: readonly(pending), answer };
}
