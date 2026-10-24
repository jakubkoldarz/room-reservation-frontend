import { readonly, shallowRef } from "vue";

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    /** Czerwony przycisk potwierdzenia — dla nieodwracalnych akcji, np. usuwania. */
    danger?: boolean;
}

interface PendingConfirm {
    options: ConfirmOptions;
    resolve: (confirmed: boolean) => void;
}

// Jeden dialog na całą aplikację, więc stan jest wspólny dla wszystkich wywołań useConfirm().
const pending = shallowRef<PendingConfirm | null>(null);

/**
 * Pyta użytkownika o potwierdzenie.
 *
 *     const confirm = useConfirm();
 *     if (!(await confirm({ title: "Delete?", message: "...", danger: true }))) return;
 */
export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
    return (options) => {
        pending.value?.resolve(false); // poprzedni, niezamknięty dialog traktujemy jak „Anuluj”
        return new Promise((resolve) => {
            pending.value = { options, resolve };
        });
    };
}

/** Tylko dla ConfirmDialog.vue: aktualne pytanie i funkcja, która na nie odpowiada. */
export function useConfirmDialogState() {
    function answer(confirmed: boolean): void {
        const current = pending.value;
        pending.value = null;
        current?.resolve(confirmed);
    }
    return { pending: readonly(pending), answer };
}
