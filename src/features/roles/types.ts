import type { schemas } from "@/api/generated";
import type { z } from "zod";

export type Role = z.infer<typeof schemas.RoleResponseDto>;
export type RoleRequest = z.input<typeof schemas.RoleRequestDto>;
