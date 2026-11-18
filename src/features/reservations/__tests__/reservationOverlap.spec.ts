import { describe, expect, it } from "vitest";
import type { Reservation } from "../types";
import { blocksNewReservation, rangesOverlap, waitingRequests } from "../utils/reservationOverlap";

function reservation(
    id: string,
    authorId: string,
    status: string,
    startTime: string,
    endTime: string,
    date = "2026-11-20",
): Reservation {
    return {
        id,
        createdBy: { at: "2026-11-01T10:00:00Z", by: { id: authorId } },
        date,
        startTime,
        endTime,
        status,
    } as Reservation;
}

describe("rangesOverlap", () => {
    it("przedziały stykające się nie nachodzą na siebie", () => {
        const morning = { startTime: "10:00:00", endTime: "11:00:00" };
        expect(rangesOverlap(morning, { startTime: "10:30", endTime: "11:30" })).toBe(true);
        expect(rangesOverlap(morning, { startTime: "11:00", endTime: "12:00" })).toBe(false);
    });
});

describe("blocksNewReservation", () => {
    const mine = reservation("a", "me", "PENDING", "10:00:00", "11:00:00");
    const theirs = reservation("b", "other", "PENDING", "10:00:00", "11:00:00");

    it("potwierdzona blokuje zawsze, odrzucona i wygasła nigdy", () => {
        expect(blocksNewReservation("approved", theirs, true, "me")).toBe(true);
        expect(blocksNewReservation("rejected", theirs, false, "me")).toBe(false);
        expect(blocksNewReservation("expired", theirs, false, "me")).toBe(false);
    });

    it("w sali z akceptacją cudza prośba nie blokuje, własna tak", () => {
        expect(blocksNewReservation("pending", theirs, true, "me")).toBe(false);
        expect(blocksNewReservation("pending", mine, true, "me")).toBe(true);
    });

    it("w sali bez akceptacji blokuje każda oczekująca", () => {
        expect(blocksNewReservation("pending", theirs, false, "me")).toBe(true);
    });
});

describe("waitingRequests", () => {
    const draft = { date: "2026-11-20", startTime: "10:00", endTime: "12:00" };

    it("zwraca tylko cudze oczekujące prośby nachodzące na termin", () => {
        const overlapping = reservation("1", "other", "PENDING", "11:00:00", "13:00:00");
        const reservations = [
            overlapping,
            reservation("2", "me", "PENDING", "10:00:00", "11:00:00"),
            reservation("3", "other", "APPROVED", "10:00:00", "11:00:00"),
            reservation("4", "other", "PENDING", "12:00:00", "13:00:00"),
            reservation("5", "other", "PENDING", "10:00:00", "11:00:00", "2026-11-21"),
            reservation("6", "other", "EXPIRED", "10:00:00", "11:00:00"),
        ];

        expect(waitingRequests(reservations, draft, "me")).toEqual([overlapping]);
    });
});
