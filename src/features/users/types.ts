import type { schemas } from "@/api/generated";
import type { z } from "zod";

export type User = z.infer<typeof schemas.BasicUserResponseDto>;
export type UserDetails = z.infer<typeof schemas.UserDetailsResponseDto>;
export type UserAccountStatus = z.infer<typeof schemas.UserAccountStatusResponseDto>;
export type RoleInfo = z.infer<typeof schemas.RoleWithPermissionsResponseDto>;
