import { describe, expect, it } from "vitest";
import type { ApiError } from "@/api/errors";
import { QuickReservationFormSchema } from "../schemas";
import {
    calendarWeekOf,
    defaultReservationDraft,
    isAvailabilityFailure,
    reservationFailureMessage,
} from "../utils/quickReservation";

function issues(input: Record<string, unknown>) {
    const result = QuickReservationFormSchema.safeParse(input);
    return result.success
        ? []
        : result.error.issues.map((issue) => [issue.path.join("."), issue.message]);
}

const filled = {
    roomId: "5f0c1a52-6b1e-4d59-9f0e-2a54a7a3c111",
    date: "2026-11-17",
    startTime: "09:00",
    endTime: "10:30",
};

describe("QuickReservationFormSchema", () => {
    it("wymaga sali, daty i godzin", () => {
        expect(issues({ roomId: "", date: "", startTime: "", endTime: "" })).toEqual([
            ["roomId", "Choose a room"],
            ["date", "Date is required"],
            ["startTime", "Start time is required"],
            ["endTime", "End time is required"],
        ]);
        expect(issues({})).toHaveLength(4);
    });

    it("nie sprawdza kolejności godzin ani przeszłości, to robi backend", () => {
        expect(issues({ ...filled, startTime: "12:00", endTime: "08:00" })).toEqual([]);
        expect(issues({ ...filled, date: "2001-01-01" })).toEqual([]);
    });

    it("cel jest opcjonalny, przycinany i ograniczony do 100 znaków", () => {
        expect(
            QuickReservationFormSchema.safeParse({ ...filled, purpose: "  Exam  " }),
        ).toMatchObject({ success: true, data: { purpose: "Exam" } });
        expect(issues({ ...filled, purpose: "x".repeat(101) })).toEqual([
            ["purpose", "Purpose can have at most 100 characters"],
        ]);
    });
});

describe("defaultReservationDraft", () => {
    it("proponuje dziś od następnej pełnej godziny na godzinę", () => {
        expect(defaultReservationDraft(new Date(2026, 10, 12, 9, 40))).toEqual({
            date: "2026-11-12",
            startTime: "10:00",
            endTime: "11:00",
        });
    });

    it("późnym wieczorem nie wychodzi poza dobę", () => {
        expect(defaultReservationDraft(new Date(2026, 10, 12, 23, 30))).toEqual({
            date: "2026-11-12",
            startTime: "22:00",
            endTime: "23:00",
        });
    });
});

describe("calendarWeekOf", () => {
    it("zwraca poniedziałek tygodnia z podaną datą", () => {
        expect(calendarWeekOf("2026-11-17")).toBe("2026-11-16");
        expect(calendarWeekOf("2026-11-16")).toBe("2026-11-16");
        expect(calendarWeekOf("2026-11-22")).toBe("2026-11-16");
    });

    it("zwraca null dla niepoprawnej daty", () => {
        expect(calendarWeekOf("")).toBeNull();
        expect(calendarWeekOf("2026-02-31")).toBeNull();
    });
});

describe("błędy tworzenia rezerwacji", () => {
    const http = (status: number, detail: string | null): ApiError => ({
        kind: "http",
        status,
        title: null,
        detail,
        conflictingItems: [],
    });

    it("pokazuje komunikat z backendu", () => {
        expect(
            reservationFailureMessage(http(400, "Selected room is not available at provided time")),
        ).toBe("Selected room is not available at provided time");
        expect(
            reservationFailureMessage({
                kind: "validation",
                fieldErrors: {},
                formErrors: ["The request is invalid"],
            }),
        ).toBe("The request is invalid");
        expect(
            reservationFailureMessage({ kind: "validation", fieldErrors: {}, formErrors: [] }),
        ).toBe("Some fields are invalid.");
    });

    it("kalendarz sali ma sens tylko przy odrzuceniu terminu", () => {
        expect(isAvailabilityFailure(http(400, null))).toBe(true);
        expect(isAvailabilityFailure(http(409, null))).toBe(true);
        expect(isAvailabilityFailure(http(404, null))).toBe(false);
        expect(isAvailabilityFailure({ kind: "network" })).toBe(false);
    });
});
