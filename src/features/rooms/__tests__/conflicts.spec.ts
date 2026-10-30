import { describe, expect, it } from "vitest";
import { isConflict } from "../utils/conflicts";

describe("isConflict", () => {
    it("tylko błąd HTTP 409 jest konfliktem", () => {
        expect(isConflict({ kind: "http", status: 409, title: null, detail: null })).toBe(true);
        expect(isConflict({ kind: "http", status: 400, title: null, detail: null })).toBe(false);
        expect(isConflict({ kind: "network" })).toBe(false);
    });
});
