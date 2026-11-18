import { describe, expect, it } from "vitest";
import { draggedRange, snapToStep } from "../utils/timelineDrag";

const LIMITS = { start: 8 * 60, end: 18 * 60 };
const TEN_TO_ELEVEN = { start: 10 * 60, end: 11 * 60 };

describe("snapToStep", () => {
    it("zaokrągla do najbliższego kwadransa", () => {
        expect(snapToStep(607)).toBe(600);
        expect(snapToStep(608)).toBe(615);
    });
});

describe("draggedRange", () => {
    it("przesunięcie zachowuje długość i idzie co kwadrans", () => {
        expect(draggedRange("move", TEN_TO_ELEVEN, 630, 662, LIMITS)).toEqual({
            start: 630,
            end: 690,
        });
    });

    it("przesunięcie zatrzymuje się na granicach osi", () => {
        expect(draggedRange("move", TEN_TO_ELEVEN, 630, 0, LIMITS)).toEqual({
            start: 480,
            end: 540,
        });
        expect(draggedRange("move", TEN_TO_ELEVEN, 630, 2000, LIMITS)).toEqual({
            start: 1020,
            end: 1080,
        });
    });

    it("lewa krawędź zmienia tylko początek i zostawia co najmniej kwadrans", () => {
        expect(draggedRange("start", TEN_TO_ELEVEN, 600, 572, LIMITS)).toEqual({
            start: 570,
            end: 660,
        });
        expect(draggedRange("start", TEN_TO_ELEVEN, 600, 700, LIMITS)).toEqual({
            start: 645,
            end: 660,
        });
    });

    it("prawa krawędź zmienia tylko koniec i nie wychodzi poza oś", () => {
        expect(draggedRange("end", TEN_TO_ELEVEN, 660, 752, LIMITS)).toEqual({
            start: 600,
            end: 750,
        });
        expect(draggedRange("end", TEN_TO_ELEVEN, 660, 5000, LIMITS)).toEqual({
            start: 600,
            end: 1080,
        });
        expect(draggedRange("end", TEN_TO_ELEVEN, 660, 500, LIMITS)).toEqual({
            start: 600,
            end: 615,
        });
    });
});
