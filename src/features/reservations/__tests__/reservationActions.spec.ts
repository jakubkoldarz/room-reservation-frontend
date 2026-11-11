import { describe, expect, it } from "vitest";
import type { Reservation } from "../types";
import { hasStarted, isOwnReservation, ownReservationActions } from "../utils/reservationActions";

const NOW = new Date(2026, 10, 11, 14, 0);

describe("hasStarted", () => {
    it("porównuje datę, a dla dzisiejszej godzinę początku", () => {
        expect(hasStarted({ date: "2026-11-10", startTime: "18:00:00" }, NOW)).toBe(true);
        expect(hasStarted({ date: "2026-11-11", startTime: "13:30:00" }, NOW)).toBe(true);
        expect(hasStarted({ date: "2026-11-11", startTime: "14:00:00" }, NOW)).toBe(true);
        expect(hasStarted({ date: "2026-11-11", startTime: "14:15:00" }, NOW)).toBe(false);
        expect(hasStarted({ date: "2026-11-12", startTime: "08:00:00" }, NOW)).toBe(false);
    });
});

describe("ownReservationActions", () => {
    const later = { date: "2026-11-12", startTime: "10:00:00" };

    it("oczekującą można edytować i wycofać, potwierdzoną edytować i anulować", () => {
        expect(ownReservationActions("pending", later, NOW)).toEqual(["edit", "withdraw"]);
        expect(ownReservationActions("approved", later, NOW)).toEqual(["edit", "cancel"]);
    });

    it("brak akcji dla odrzuconych, anulowanych i już rozpoczętych", () => {
        expect(ownReservationActions("rejected", later, NOW)).toEqual([]);
        expect(ownReservationActions("canceled", later, NOW)).toEqual([]);
        expect(
            ownReservationActions("approved", { date: "2026-11-11", startTime: "09:00:00" }, NOW),
        ).toEqual([]);
    });
});

describe("isOwnReservation", () => {
    const reservation = { createdBy: { by: { id: "me" } } } as Reservation;

    it("sprawdza autora i brak zalogowanego użytkownika", () => {
        expect(isOwnReservation(reservation, "me")).toBe(true);
        expect(isOwnReservation(reservation, "other")).toBe(false);
        expect(isOwnReservation(reservation, undefined)).toBe(false);
    });
});
