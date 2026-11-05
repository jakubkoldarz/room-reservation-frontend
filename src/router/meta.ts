import type { Permission } from "@/features/auth/constants/permissions";
import "vue-router";

declare module "vue-router" {
    interface RouteMeta {
        requiresAuth?: boolean;
        requiresGuest?: boolean;
        onboarding?: boolean;
        requiredPermission?: Permission;
    }
}
