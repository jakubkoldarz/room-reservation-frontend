import { describe, expect, it } from "vitest";
import type { Reservation } from "../types";
import { formatUserName, getReservationState } from "../utils/reservationState";

const USER = { id: "6f1c2a3e-1b2c-4d5e-8f90-123456789abc", firstname: "Anna", lastname: "Nowak" };
const ACTOR = { at: "2026-10-31T09:00:00Z", by: USER };

function reservation(overrides: Partial<Reservation> = {}): Reservation {
    return {
        id: crypto.randomUUID(),
        createdBy: ACTOR,
        date: "2026-11-02",
        startTime: "10:00:00",
        endTime: "12:00:00",
        ...overrides,
    };
}

describe("getReservationState", () => {
    it("status tekstowy z backendu ma pierwszeństwo, bez względu na wielkość liter", () => {
        expect(getReservationState(reservation({ status: "Canceled" }), true)).toBe("canceled");
        expect(getReservationState(reservation({ status: "REJECTED" }), true)).toBe("rejected");
        expect(getReservationState(reservation({ status: "Pending" }), false)).toBe("pending");
        expect(getReservationState(reservation({ status: "Approved" }), true)).toBe("approved");
    });

    it("bez statusu → wnioskowanie z pól aktorów", () => {
        expect(getReservationState(reservation({ canceledBy: ACTOR }), true)).toBe("canceled");
        expect(getReservationState(reservation({ rejectedBy: ACTOR }), true)).toBe("rejected");
        expect(getReservationState(reservation({ approvedBy: ACTOR }), true)).toBe("approved");
    });

    it("bez statusu i akceptacji zależy od trybu pokoju", () => {
        expect(getReservationState(reservation(), true)).toBe("pending");
        expect(getReservationState(reservation(), false)).toBe("approved");
    });
});

describe("formatUserName", () => {
    it("składa imię i nazwisko albo zwraca zastępczy tekst", () => {
        expect(formatUserName(USER)).toBe("Anna Nowak");
        expect(formatUserName({ id: USER.id, firstname: "Anna" })).toBe("Anna");
        expect(formatUserName({ id: USER.id, firstname: null, lastname: null })).toBe(
            "Unknown user",
        );
    });
});
