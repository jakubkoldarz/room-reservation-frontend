import { z } from "zod";
import { pageParam, textParam } from "@/composables/useListQuery";
import { EmailSchema, MIN_PASSWORD_LENGTH } from "@/features/auth/schemas";

export const ChangePasswordFormSchema = z
    .object({
        oldPassword: z
            .string({ required_error: "Current password is required" })
            .min(1, "Current password is required"),
        newPassword: z
            .string({ required_error: "New password is required" })
            .min(
                MIN_PASSWORD_LENGTH,
                `Password must have at least ${MIN_PASSWORD_LENGTH} characters`,
            ),
        confirmPassword: z
            .string({ required_error: "Repeat the new password" })
            .min(1, "Repeat the new password"),
    })
    .refine((values) => values.newPassword === values.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const ChangeEmailFormSchema = z.object({
    email: EmailSchema,
});

export const PROFILE_TABS = ["calendar", "reservations", "security", "account"] as const;

export const ProfileTabSchema = z.enum(PROFILE_TABS).catch("calendar");

export const MyReservationsQuerySchema = z.object({
    page: pageParam,
    when: textParam,
    status: textParam,
    sort: textParam,
});
