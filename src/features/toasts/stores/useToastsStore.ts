import { defineStore } from "pinia";
import type { Toast, ToastOptions } from "../types/toast";
import type { ApiErrorResponse } from "@/types/api-error";

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
        pushApiError(options: { title: string; error: ApiErrorResponse | null }) {
            const id = crypto.randomUUID();
            const title = options.title;
            const message = options.error?.message ?? "Unknown error occured";
            this.toasts.push({ id, title, message, type: "error" });
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
