import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { RoleFormSchema } from "./schemas";

export type Role = z.infer<typeof schemas.RoleResponseDto>;
export type RoleRequest = z.input<typeof schemas.RoleRequestDto>;
export type PermissionItem = z.infer<typeof schemas.PermissionResponseDto>;
export type RoleForm = z.infer<typeof RoleFormSchema>;

export type PermissionOption = {
    id: string;
    label: string;
};

export type PermissionOptionGroup = {
    area: string;
    options: PermissionOption[];
};
