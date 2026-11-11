export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
    input?: ConfirmInput;
    items?: readonly ConfirmItem[];
    warning?: ConfirmWarning;
}

export interface ConfirmWarning {
    title: string;
    points: readonly string[];
    note?: string;
}

export interface ConfirmItem {
    primary: string;
    secondary?: string;
}

export interface ConfirmInput {
    label: string;
    maxLength?: number;
}
