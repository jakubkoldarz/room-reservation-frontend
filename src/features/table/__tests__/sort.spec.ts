import { describe, expect, it } from "vitest";
import {
    formatSort,
    isSameSort,
    nextSort,
    parseSort,
    sortKeys,
    toSortQueries,
} from "../utils/sort";

describe("sortKeys", () => {
    it("zbiera tylko kolumny z kluczem sortowania", () => {
        expect(
            sortKeys([
                { key: "name", sortKey: "name" },
                { key: "delete" },
                { key: "dates", sortKey: "startDate" },
            ]),
        ).toEqual(["name", "startDate"]);
    });
});

describe("parseSort / formatSort", () => {
    const allowed = ["name", "date"];

    it("minus na początku oznacza malejąco", () => {
        expect(parseSort("name", allowed)).toEqual({ by: "name", direction: "asc" });
        expect(parseSort("-date", allowed)).toEqual({ by: "date", direction: "desc" });
    });

    it("odrzuca puste i nieznane pola z URL", () => {
        expect(parseSort("", allowed)).toBeNull();
        expect(parseSort("-", allowed)).toBeNull();
        expect(parseSort("--name", allowed)).toBeNull();
        expect(parseSort("capacity", allowed)).toBeNull();
    });

    it("formatSort jest odwrotnością parseSort", () => {
        expect(formatSort({ by: "date", direction: "desc" })).toBe("-date");
        expect(formatSort({ by: "name", direction: "asc" })).toBe("name");
    });
});

describe("nextSort", () => {
    it("ta sama kolumna odwraca kierunek, inna zaczyna rosnąco", () => {
        expect(nextSort({ by: "name", direction: "asc" }, "name")).toEqual({
            by: "name",
            direction: "desc",
        });
        expect(nextSort({ by: "name", direction: "desc" }, "name")).toEqual({
            by: "name",
            direction: "asc",
        });
        expect(nextSort({ by: "name", direction: "desc" }, "date")).toEqual({
            by: "date",
            direction: "asc",
        });
    });
});

describe("isSameSort / toSortQueries", () => {
    it("porównuje pole i kierunek oraz mapuje na parametry API", () => {
        expect(isSameSort({ by: "a", direction: "asc" }, { by: "a", direction: "asc" })).toBe(true);
        expect(isSameSort({ by: "a", direction: "asc" }, { by: "a", direction: "desc" })).toBe(
            false,
        );
        expect(toSortQueries({ by: "date", direction: "desc" })).toEqual({
            SortBy: "date",
            SortDirection: "desc",
        });
    });
});
