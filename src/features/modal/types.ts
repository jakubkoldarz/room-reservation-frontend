export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    input?: ConfirmInput;
}

export interface ConfirmInput {
    label: string;
    maxLength?: number;
}
