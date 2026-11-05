import type { UserAccountStatus } from "@/features/users/types";
import { authRoutes } from "../routes";
import type { OnboardingRouteName } from "../types";

export function onboardingRouteName(status: UserAccountStatus): OnboardingRouteName | null {
    if (!status.hasEmailVerified) return authRoutes.verifyEmail.name;
    if (!status.hasProfileCompleted) return authRoutes.completeProfile.name;
    return null;
}

export function safeRedirect(value: unknown): string | null {
    const path = Array.isArray(value) ? value[0] : value;
    if (typeof path !== "string") return null;
    if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return null;
    return path;
}
