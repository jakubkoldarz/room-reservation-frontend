import { describe, expect, it } from "vitest";
import { ReservationFormSchema } from "../schemas";

function issues(input: Record<string, unknown>) {
    const result = ReservationFormSchema.safeParse(input);
    return result.success
        ? []
        : result.error.issues.map((issue) => [issue.path.join("."), issue.message]);
}

describe("ReservationFormSchema", () => {
    it("poprawny formularz, cel opcjonalny i przycięty", () => {
        const result = ReservationFormSchema.safeParse({
            date: "2026-11-09",
            startTime: "09:00",
            endTime: "10:30",
            purpose: "  Thesis consultation  ",
        });
        expect(result).toMatchObject({ success: true, data: { purpose: "Thesis consultation" } });
        expect(issues({ date: "2026-11-09", startTime: "09:00", endTime: "10:30" })).toEqual([]);
    });

    it("koniec musi być po początku", () => {
        expect(issues({ date: "2026-11-09", startTime: "10:00", endTime: "10:00" })).toEqual([
            ["endTime", "End time must be after start time"],
        ]);
    });

    it("brak daty lub godzin i za długi cel", () => {
        expect(
            issues({ date: "", startTime: "9", endTime: "", purpose: "x".repeat(101) }).map(
                ([path]) => path,
            ),
        ).toEqual(["date", "startTime", "endTime", "purpose"]);
    });
});
