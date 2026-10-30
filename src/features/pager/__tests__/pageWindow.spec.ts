import { describe, expect, it } from "vitest";
import type { PageItem } from "../types";
import { pageWindow } from "../utils/pageWindow";

function render(items: PageItem[]): string {
    return items
        .map((item) => {
            if (item.kind === "gap") return "…";
            return item.active ? `[${item.page}]` : String(item.page);
        })
        .join(" ");
}

describe("pageWindow", () => {
    it.each([
        [1, 1, "[1]"],
        [2, 5, "1 [2] 3 4 5"],
        [1, 10, "[1] 2 … 10"],
        [3, 10, "1 2 [3] 4 … 10"],
        [4, 10, "1 2 3 [4] 5 … 10"],
        [5, 10, "1 … 4 [5] 6 … 10"],
        [7, 10, "1 … 6 [7] 8 9 10"],
        [10, 10, "1 … 9 [10]"],
    ])("pageWindow(%i, %i) → %s", (current, total, expected) => {
        expect(render(pageWindow(current, total))).toBe(expected);
    });

    it("przycina bieżącą stronę do zakresu", () => {
        expect(render(pageWindow(15, 10))).toBe("1 … 9 [10]");
        expect(render(pageWindow(0, 3))).toBe("[1] 2 3");
    });

    it("traktuje total < 1 i NaN jak jedną stronę", () => {
        expect(render(pageWindow(1, 0))).toBe("[1]");
        expect(render(pageWindow(Number.NaN, Number.NaN))).toBe("[1]");
    });

    it("daje dwóm przerwom różne klucze (v-for)", () => {
        const gaps = pageWindow(5, 10).filter((item) => item.kind === "gap");
        expect(gaps).toEqual([
            { kind: "gap", key: "gap-start" },
            { kind: "gap", key: "gap-end" },
        ]);
    });

    it("uwzględnia liczbę sąsiadów", () => {
        expect(render(pageWindow(10, 20, 2))).toBe("1 … 8 9 [10] 11 12 … 20");
    });
});
