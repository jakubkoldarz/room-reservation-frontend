import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { UserListQuerySchema } from "./schemas";

export type User = z.infer<typeof schemas.BasicUserResponseDto>;
export type UserListItem = z.infer<typeof schemas.UserListItemResponseDto>;
export type UserDetails = z.infer<typeof schemas.UserDetailsResponseDto>;
export type UserAccountStatus = z.infer<typeof schemas.UserAccountStatusResponseDto>;
export type RoleInfo = z.infer<typeof schemas.RoleWithPermissionsResponseDto>;
export type UserListQuery = z.infer<typeof UserListQuerySchema>;
