import { readonly, shallowRef } from "vue";
import type { ConfirmOptions } from "../types";

interface PendingConfirm {
    options: ConfirmOptions;
    resolve: (confirmed: boolean, value: string) => void;
}

const pending = shallowRef<PendingConfirm | null>(null);

function open(options: ConfirmOptions, resolve: PendingConfirm["resolve"]): void {
    pending.value?.resolve(false, "");
    pending.value = { options, resolve };
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
    return (options) => new Promise((resolve) => open(options, (confirmed) => resolve(confirmed)));
}

export function usePrompt(): (
    options: ConfirmOptions & Required<Pick<ConfirmOptions, "input">>,
) => Promise<string | null> {
    return (options) =>
        new Promise((resolve) =>
            open(options, (confirmed, value) => resolve(confirmed ? value.trim() : null)),
        );
}

export function useConfirmDialogState() {
    function answer(confirmed: boolean, value = ""): void {
        const current = pending.value;
        pending.value = null;
        current?.resolve(confirmed, value);
    }
    return { pending: readonly(pending), answer };
}
