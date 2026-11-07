export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    input?: ConfirmInput;
    items?: readonly ConfirmItem[];
}

export interface ConfirmItem {
    primary: string;
    secondary?: string;
}

export interface ConfirmInput {
    label: string;
    maxLength?: number;
}
