import { describe, expect, it } from "vitest";
import type { Reservation } from "../types";
import {
    calendarBlockActions,
    hasStarted,
    isOwnReservation,
    moderatorReservationActions,
    ownReservationActions,
} from "../utils/reservationActions";

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

const ALL_PERMISSIONS = { canApprove: true, canReject: true, canForceCancel: true };
const NO_PERMISSIONS = { canApprove: false, canReject: false, canForceCancel: false };

describe("moderatorReservationActions", () => {
    const later = { date: "2026-11-12", startTime: "10:00:00" };
    const started = { date: "2026-11-11", startTime: "09:00:00" };

    it("oczekującą można zatwierdzić i odrzucić, potwierdzoną anulować", () => {
        expect(moderatorReservationActions("pending", later, NOW, ALL_PERMISSIONS)).toEqual([
            "approve",
            "reject",
        ]);
        expect(moderatorReservationActions("approved", later, NOW, ALL_PERMISSIONS)).toEqual([
            "forceCancel",
        ]);
    });

    it("każda akcja wymaga swojego uprawnienia", () => {
        const onlyReject = { canApprove: false, canReject: true, canForceCancel: false };
        expect(moderatorReservationActions("pending", later, NOW, onlyReject)).toEqual(["reject"]);
        expect(moderatorReservationActions("pending", later, NOW, NO_PERMISSIONS)).toEqual([]);
    });

    it("brak akcji po starcie i dla zakończonych statusów", () => {
        expect(moderatorReservationActions("pending", started, NOW, ALL_PERMISSIONS)).toEqual([]);
        expect(moderatorReservationActions("expired", later, NOW, ALL_PERMISSIONS)).toEqual([]);
        expect(moderatorReservationActions("rejected", later, NOW, ALL_PERMISSIONS)).toEqual([]);
    });
});

describe("calendarBlockActions", () => {
    const later = { date: "2026-11-12", startTime: "10:00:00" };

    it("łączy akcje własne i moderatora", () => {
        expect(calendarBlockActions("pending", later, NOW, true, ALL_PERMISSIONS)).toEqual([
            "edit",
            "withdraw",
            "approve",
            "reject",
        ]);
    });

    it("przy własnej potwierdzonej nie dubluje anulowania", () => {
        expect(calendarBlockActions("approved", later, NOW, true, ALL_PERMISSIONS)).toEqual([
            "edit",
            "cancel",
        ]);
    });

    it("cudza rezerwacja ma tylko akcje moderatora", () => {
        expect(calendarBlockActions("approved", later, NOW, false, ALL_PERMISSIONS)).toEqual([
            "forceCancel",
        ]);
        expect(calendarBlockActions("pending", later, NOW, false, NO_PERMISSIONS)).toEqual([]);
    });
});
