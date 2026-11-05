import type { z } from "zod";
import type { ChangeEmailFormSchema, ChangePasswordFormSchema } from "./schemas";

export type ChangePasswordForm = z.infer<typeof ChangePasswordFormSchema>;
export type ChangeEmailForm = z.infer<typeof ChangeEmailFormSchema>;

export type SessionDevice = {
    browser: string | null;
    os: string | null;
    isMobile: boolean;
};
