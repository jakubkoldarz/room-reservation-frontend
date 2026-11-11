import { describe, expect, it } from "vitest";
import { editTimeProblem, formatSlots, isSameTimeRange } from "../utils/reservationEdit";

const NOW = new Date(2026, 10, 11, 12, 0);
const SLOTS = [{ dayOfWeek: 3, startTime: "08:00:00", endTime: "16:00:00" }];
const ORIGINAL = { startTime: "13:00:00", endTime: "14:00:00" };

function problem(startTime: string, endTime: string, overrides: object = {}) {
    return editTimeProblem({
        range: { startTime, endTime },
        original: ORIGINAL,
        date: "2026-11-12",
        slots: SLOTS,
        others: [{ startTime: "10:00:00", endTime: "11:00:00" }],
        now: NOW,
        ...overrides,
    });
}

describe("editTimeProblem", () => {
    it("brak problemu dla wolnego czasu w godzinach otwarcia", () => {
        expect(problem("13:00", "15:00")).toBeNull();
        expect(problem("11:00", "12:00")).toBeNull();
        expect(problem("08:00", "10:00")).toBeNull();
    });

    it("pomija niepoprawny zakres, bo zgłasza go schemat", () => {
        expect(problem("15:00", "14:00")).toBeNull();
    });

    it("poza godzinami otwarcia albo dzień zamknięty", () => {
        expect(problem("15:00", "17:00")).toBe(
            "Choose a time within the opening hours: 08:00–16:00.",
        );
        expect(problem("13:00", "14:00", { slots: [] })).toBe("The room is closed on this day.");
    });

    it("nakładanie z inną rezerwacją", () => {
        expect(problem("10:30", "12:00")).toBe(
            "This time overlaps another reservation (10:00–11:00).",
        );
    });

    it("dzisiaj: zmieniony początek nie może być w przeszłości, niezmieniony może", () => {
        const today = { date: "2026-11-11" };
        expect(problem("11:00", "14:00", today)).toBe("This start time has already passed.");
        expect(problem("12:00", "14:00", today)).toBe("This start time has already passed.");
        expect(problem("13:00", "15:00", today)).toBeNull();
    });
});

describe("formatSlots / isSameTimeRange", () => {
    it("formatuje przedziały i porównuje godziny bez sekund", () => {
        expect(
            formatSlots([...SLOTS, { dayOfWeek: 3, startTime: "17:00", endTime: "19:30" }]),
        ).toBe("08:00–16:00, 17:00–19:30");
        expect(isSameTimeRange({ startTime: "13:00", endTime: "14:00" }, ORIGINAL)).toBe(true);
        expect(isSameTimeRange({ startTime: "13:00", endTime: "14:15" }, ORIGINAL)).toBe(false);
    });
});
