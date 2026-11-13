import { z } from "zod";

export const ROLE_NAME_MAX_LENGTH = 50;

export const RoleFormSchema = z.object({
    name: z
        .string()
        .trim()
        .min(1, "Name is required")
        .max(ROLE_NAME_MAX_LENGTH, `Name can have at most ${ROLE_NAME_MAX_LENGTH} characters`),
    isDefault: z.boolean(),
    isSuperAdmin: z.boolean(),
});
