import { readonly, shallowRef } from "vue";

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface PendingConfirm {
    options: ConfirmOptions;
    resolve: (confirmed: boolean) => void;
}

const pending = shallowRef<PendingConfirm | null>(null);

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
    return (options) => {
        pending.value?.resolve(false);
        return new Promise((resolve) => {
            pending.value = { options, resolve };
        });
    };
}

export function useConfirmDialogState() {
    function answer(confirmed: boolean): void {
        const current = pending.value;
        pending.value = null;
        current?.resolve(confirmed);
    }
    return { pending: readonly(pending), answer };
}
