import { describe, expect, it } from "vitest";
import { authRoutes } from "../routes";
import { onboardingRouteName, safeRedirect } from "../utils/onboarding";

const status = (hasEmailVerified: boolean, hasProfileCompleted: boolean) => ({
    hasEmailVerified,
    hasProfileCompleted,
    has2faEnabled: false,
});

describe("onboardingRouteName", () => {
    it("najpierw potwierdzenie maila, nawet gdy profil jest uzupełniony", () => {
        expect(onboardingRouteName(status(false, false))).toBe(authRoutes.verifyEmail.name);
        expect(onboardingRouteName(status(false, true))).toBe(authRoutes.verifyEmail.name);
    });

    it("po potwierdzeniu maila uzupełnienie profilu", () => {
        expect(onboardingRouteName(status(true, false))).toBe(authRoutes.completeProfile.name);
    });

    it("konto gotowe → brak kroku", () => {
        expect(onboardingRouteName(status(true, true))).toBeNull();
    });
});

describe("safeRedirect", () => {
    it("przepuszcza ścieżki w aplikacji", () => {
        expect(safeRedirect("/rooms?floor=2")).toBe("/rooms?floor=2");
        expect(safeRedirect(["/buildings", "/rooms"])).toBe("/buildings");
    });

    it("odrzuca adresy zewnętrzne i śmieci", () => {
        expect(safeRedirect("https://evil.example")).toBeNull();
        expect(safeRedirect("//evil.example")).toBeNull();
        expect(safeRedirect("/\\evil.example")).toBeNull();
        expect(safeRedirect("rooms")).toBeNull();
        expect(safeRedirect(undefined)).toBeNull();
        expect(safeRedirect(null)).toBeNull();
    });
});
