import { defineStore } from "pinia";
import type { Toast, ToastOptions } from "../types/toast";

export const useToastsStore = defineStore("toasts", {
    state: () => ({
        toasts: [] as Toast[],
    }),

    actions: {
        push(toast: Omit<Toast, "id">) {
            const id = crypto.randomUUID();
            this.toasts.push({ id: id, ...toast });
        },
        pop() {
            this.toasts.pop();
        },
        remove(toastId: string) {
            this.toasts = this.toasts.filter((t) => t.id !== toastId);
        },
        pushSuccess(options: ToastOptions) {
            const id = crypto.randomUUID();
            this.toasts.push({ id, ...options, type: "success" });
        },
        pushError(options: ToastOptions) {
            const id = crypto.randomUUID();
            this.toasts.push({ id, ...options, type: "error" });
        },
        pushInfo(options: ToastOptions) {
            const id = crypto.randomUUID();
            this.toasts.push({ id, ...options, type: "info" });
        },
        pushWarning(options: ToastOptions) {
            const id = crypto.randomUUID();
            this.toasts.push({ id, ...options, type: "warning" });
        },
    },
});
