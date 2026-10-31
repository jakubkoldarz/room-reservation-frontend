import { describe, expect, it } from "vitest";
import type { Availability } from "../types";
import { availabilityErrors, boundsHints, clampToBounds } from "../utils/bounds";

const MONDAY = 1;
const TUESDAY = 2;

function slot(dayOfWeek: number, startTime: string, endTime: string): Availability {
    return { dayOfWeek, startTime, endTime };
}

const building = [slot(MONDAY, "08:00:00", "16:00:00")];

describe("availabilityErrors", () => {
    it("godziny w granicach budynku → brak błędów, także dla formatów HH:mm i HH:mm:ss", () => {
        expect(availabilityErrors([slot(MONDAY, "08:00", "16:00")], building)).toEqual({});
        expect(availabilityErrors([slot(MONDAY, "09:00:00", "12:00:00")], building)).toEqual({});
    });

    it("wyjście poza godziny budynku albo dzień, w którym budynek jest zamknięty", () => {
        const errors = availabilityErrors(
            [slot(MONDAY, "07:30", "16:00"), slot(TUESDAY, "09:00", "12:00")],
            building,
        );
        expect(errors[MONDAY]).toBe("Must be within building hours 08:00–16:00");
        expect(errors[TUESDAY]).toBe("The building is closed on this day");
    });

    it("start nie przed końcem → błąd niezależnie od budynku", () => {
        expect(availabilityErrors([slot(MONDAY, "12:00", "12:00")], null)).toEqual({
            [MONDAY]: "Opening time must be before closing time",
        });
    });

    it("bez godzin budynku (brak uprawnień) sprawdza tylko kolejność godzin", () => {
        expect(availabilityErrors([slot(TUESDAY, "06:00", "22:00")], null)).toEqual({});
    });
});

describe("boundsHints", () => {
    it("podpowiedź dla każdego dnia tygodnia", () => {
        const hints = boundsHints(building);
        expect(hints[MONDAY]).toBe("Building open 08:00–16:00");
        expect(hints[0]).toBe("Building closed");
        expect(boundsHints(null)).toEqual({});
    });
});

describe("clampToBounds", () => {
    it("przycina godziny do budynku i usuwa dni, w które budynek jest zamknięty", () => {
        expect(
            clampToBounds(
                [slot(MONDAY, "07:00", "12:00"), slot(TUESDAY, "09:00", "12:00")],
                building,
            ),
        ).toEqual([slot(MONDAY, "08:00:00", "12:00")]);
    });

    it("usuwa dzień, który po przycięciu jest pusty", () => {
        expect(clampToBounds([slot(MONDAY, "17:00", "18:00")], building)).toEqual([]);
    });
});
