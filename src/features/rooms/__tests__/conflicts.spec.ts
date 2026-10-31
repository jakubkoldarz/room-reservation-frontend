import { describe, expect, it } from "vitest";
import type { ApiError } from "@/api/errors";
import {
    isConflict,
    reservationConflicts,
    reservationsAffectedMessage,
    roomConflicts,
} from "../utils/conflicts";

function httpError(status: number, conflictingItems: unknown[] = []): ApiError {
    return { kind: "http", status, title: null, detail: null, conflictingItems };
}

const RESERVATION = {
    reservationId: "r1",
    date: "2026-11-03",
    startTime: "10:00:00",
    endTime: "12:00:00",
    roomId: "room-1",
    status: "APPROVED",
};

describe("isConflict", () => {
    it("tylko błąd HTTP 409 jest konfliktem", () => {
        expect(isConflict(httpError(409))).toBe(true);
        expect(isConflict(httpError(400))).toBe(false);
        expect(isConflict({ kind: "network" })).toBe(false);
    });
});

describe("reservationConflicts", () => {
    it("409 z rezerwacjami → lista rezerwacji do anulowania", () => {
        expect(reservationConflicts(httpError(409, [RESERVATION]))).toEqual([RESERVATION]);
    });

    it("409 bez listy (np. godziny poza budynkiem, duplikat identyfikatora) → brak", () => {
        expect(reservationConflicts(httpError(409))).toEqual([]);
    });

    it("409 z innymi elementami (nakładające się wydarzenia) → brak", () => {
        const event = {
            eventId: "e1",
            name: "Open day",
            startDate: "2026-11-03",
            endDate: "2026-11-04",
        };
        expect(reservationConflicts(httpError(409, [event]))).toEqual([]);
    });

    it("inne błędy → brak", () => {
        expect(reservationConflicts(httpError(400, [RESERVATION]))).toEqual([]);
        expect(reservationConflicts({ kind: "network" })).toEqual([]);
    });
});

describe("roomConflicts", () => {
    it("409 z pokojami spoza nowych godzin budynku → lista pokoi", () => {
        const room = { roomId: "room-1", identifier: "A101" };
        expect(roomConflicts(httpError(409, [room]))).toEqual([room]);
        expect(roomConflicts(httpError(409, [RESERVATION]))).toEqual([]);
    });
});

describe("reservationsAffectedMessage", () => {
    it("liczba pojedyncza i mnoga", () => {
        expect(reservationsAffectedMessage(1)).toBe(
            "1 upcoming reservation will be canceled and its owner notified.",
        );
        expect(reservationsAffectedMessage(3)).toContain("3 upcoming reservations");
    });
});
