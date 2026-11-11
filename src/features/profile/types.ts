import type { z } from "zod";
import type {
    ChangeEmailFormSchema,
    ChangePasswordFormSchema,
    MyReservationsQuerySchema,
    PROFILE_TABS,
} from "./schemas";

export type ChangePasswordForm = z.infer<typeof ChangePasswordFormSchema>;
export type ChangeEmailForm = z.infer<typeof ChangeEmailFormSchema>;

export type SessionDevice = {
    browser: string | null;
    os: string | null;
    isMobile: boolean;
};

export type ProfileTab = (typeof PROFILE_TABS)[number];

export type MyReservationsQuery = z.infer<typeof MyReservationsQuerySchema>;

export type MyReservationAction = "edit" | "withdraw" | "cancel";

export type PermissionGroup = {
    area: string;
    actions: string[];
};
