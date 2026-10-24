import { describe, expect, it } from "vitest";
import { QuestionMarkCircleIcon, TvIcon } from "@heroicons/vue/24/solid";
import { iconFor, iconLabel, isEquipmentIconName, searchIcons } from "../icons";
import { EquipmentFormSchema } from "../schemas";

describe("ikony sprzętu", () => {
    it("rozpoznaje tylko ikony Heroicons solid", () => {
        expect(isEquipmentIconName("TvIcon")).toBe(true);
        expect(isEquipmentIconName("RocketLaunchIcon")).toBe(true);
        expect(isEquipmentIconName("NotAnIcon")).toBe(false);
        expect(isEquipmentIconName("toString")).toBe(false);
    });

    it("wyszukuje bez względu na wielkość liter, spacje i myślniki", () => {
        expect(searchIcons("computer-desktop")).toEqual(["ComputerDesktopIcon"]);
        expect(searchIcons("Computer Desktop")).toEqual(["ComputerDesktopIcon"]);
        expect(searchIcons("arrow").length).toBeGreaterThan(10);
        expect(searchIcons("").length).toBeGreaterThan(300);
        expect(searchIcons("zzzz")).toEqual([]);
    });

    it("nieznana nazwa → znak zapytania", () => {
        expect(iconFor("TvIcon")).toBe(TvIcon);
        expect(iconFor("whatever")).toBe(QuestionMarkCircleIcon);
    });

    it("robi czytelną etykietę", () => {
        expect(iconLabel("ComputerDesktopIcon")).toBe("Computer Desktop");
    });
});

describe("EquipmentFormSchema", () => {
    it("przyjmuje poprawne dane i przycina nazwę", () => {
        expect(EquipmentFormSchema.parse({ name: "  Projector ", icon: "TvIcon" })).toEqual({
            name: "Projector",
            icon: "TvIcon",
        });
    });

    it("odrzuca pustą nazwę, za długą nazwę i nieznaną ikonę", () => {
        const result = EquipmentFormSchema.safeParse({ name: "   ", icon: "NotAnIcon" });
        expect(result.success).toBe(false);
        expect(result.error?.flatten().fieldErrors).toEqual({
            name: ["Name is required"],
            icon: ["Pick an icon"],
        });

        expect(
            EquipmentFormSchema.safeParse({ name: "x".repeat(51), icon: "TvIcon" }).success,
        ).toBe(false);
    });
});
