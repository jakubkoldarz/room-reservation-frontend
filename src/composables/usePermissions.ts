import type { Permission } from "@/features/auth/constants/permissions";
import { useAuthStore } from "@/features/auth/stores/useAuthStore";

export function usePermissions() {
    const authStore = useAuthStore();

    function hasPermission(permission: Permission): boolean {
        return authStore?.user?.roleInfo?.permissions?.includes(permission) ?? false;
    }

    return { hasPermission };
}
