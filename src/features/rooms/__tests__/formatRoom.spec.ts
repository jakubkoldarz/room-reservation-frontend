import { describe, expect, it } from "vitest";
import {
    approvalLabel,
    approvalShortLabel,
    formatCapacity,
    formatFloor,
} from "../utils/formatRoom";

describe("formatFloor", () => {
    it("parter, piętra i piwnice", () => {
        expect(formatFloor(0)).toBe("Ground floor");
        expect(formatFloor(3)).toBe("Floor 3");
        expect(formatFloor(-1)).toBe("Basement 1");
    });
});

describe("formatCapacity", () => {
    it("liczba pojedyncza i mnoga", () => {
        expect(formatCapacity(1)).toBe("1 person");
        expect(formatCapacity(30)).toBe("30 people");
    });
});

describe("approvalLabel", () => {
    it("opis zależy od wymagania akceptacji", () => {
        expect(approvalLabel(true)).toMatch(/^Requires approval/);
        expect(approvalLabel(false)).toMatch(/^Instant booking/);
    });

    it("krótka etykieta jest początkiem pełnego opisu", () => {
        expect(approvalLabel(true)).toContain(approvalShortLabel(true));
        expect(approvalLabel(false)).toContain(approvalShortLabel(false));
    });
});
