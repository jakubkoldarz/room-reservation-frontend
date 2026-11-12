import { describe, expect, it } from "vitest";
import type { ReservationListItem } from "@/features/reservations/types";
import { dateTile, upcomingReservations } from "../utils/upcoming";

function reservation(
    id: string,
    date: string,
    startTime: string,
    endTime: string,
    status = "Approved",
): ReservationListItem {
    return {
        reservationInfo: {
            id,
            createdBy: { at: "2026-11-01T10:00:00+00:00", by: { id: "u1" } },
            date,
            startTime,
            endTime,
            status,
        },
        roomInfo: { id: "r1", identifier: "A-101", requiresApproval: true, capacity: 10, floor: 1 },
        buildingInfo: {
            id: "b1",
            name: "Main",
            street: "Street 1",
            city: "City",
            postalCode: "00-001",
            floorsCount: 3,
        },
    };
}

function ids(items: ReservationListItem[]): string[] {
    return items.map((item) => item.reservationInfo.id);
}

const now = new Date(2026, 10, 12, 10, 30);

describe("upcomingReservations", () => {
    it("zostawia tylko oczekujące i potwierdzone", () => {
        const items = [
            reservation("approved", "2026-11-13", "09:00:00", "10:00:00", "Approved"),
            reservation("pending", "2026-11-13", "11:00:00", "12:00:00", "Pending"),
            reservation("rejected", "2026-11-13", "13:00:00", "14:00:00", "Rejected"),
            reservation("canceled", "2026-11-13", "15:00:00", "16:00:00", "Canceled"),
        ];
        expect(ids(upcomingReservations(items, now, 5))).toEqual(["approved", "pending"]);
    });

    it("pomija zakończone dzisiaj, zostawia trwające", () => {
        const items = [
            reservation("ended", "2026-11-12", "08:00:00", "10:30:00"),
            reservation("ongoing", "2026-11-12", "10:00:00", "11:00:00"),
            reservation("yesterday", "2026-11-11", "12:00:00", "13:00:00"),
        ];
        expect(ids(upcomingReservations(items, now, 5))).toEqual(["ongoing"]);
    });

    it("sortuje po dacie i godzinie, obcina do limitu", () => {
        const items = [
            reservation("c", "2026-11-14", "08:00:00", "09:00:00"),
            reservation("b", "2026-11-13", "12:00:00", "13:00:00"),
            reservation("a", "2026-11-13", "09:00:00", "10:00:00"),
        ];
        expect(ids(upcomingReservations(items, now, 5))).toEqual(["a", "b", "c"]);
        expect(ids(upcomingReservations(items, now, 2))).toEqual(["a", "b"]);
    });
});

describe("dateTile", () => {
    it("rozbija datę na dzień tygodnia, dzień i miesiąc", () => {
        expect(dateTile("2026-11-12")).toEqual({ weekday: "Thu", day: "12", month: "Nov" });
    });

    it("niepoprawna data nie wywraca widoku", () => {
        expect(dateTile("oops")).toEqual({ weekday: "", day: "?", month: "" });
    });
});
