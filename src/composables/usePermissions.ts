import type { Permission } from "@/features/auth/constants/permissions";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export function usePermissions() {
    const authStore = useAuthStore();

    function hasPermission(permission: Permission): boolean {
        const user = authStore.user;
        if (!user) return false;
        return user.roleInfo.permissions.includes(permission);
    }

    return { hasPermission };
}
