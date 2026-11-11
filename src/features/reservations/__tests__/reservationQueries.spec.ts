import { describe, expect, it } from "vitest";
import type { ReservationListQuery } from "../types";
import { isPastFirst, toReservationQueries } from "../utils/reservationQueries";

const ID = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
const TODAY = new Date(2026, 10, 11);

function query(overrides: Partial<ReservationListQuery> = {}): ReservationListQuery {
    return {
        page: 1,
        when: "",
        status: "",
        date: "",
        building: "",
        room: "",
        createdBy: "",
        approvedBy: "",
        canceledBy: "",
        sort: "",
        ...overrides,
    };
}

describe("toReservationQueries", () => {
    it("puste filtry → dzisiejsze i przyszłe, strona i rozmiar", () => {
        expect(toReservationQueries(query(), 25, TODAY)).toEqual({
            Status: undefined,
            Date: undefined,
            DateFrom: "2026-11-11",
            BuildingId: undefined,
            RoomId: undefined,
            CreatedById: undefined,
            ApprovedById: undefined,
            CanceledById: undefined,
            Page: 1,
            PageSize: 25,
        });
    });

    it("status z URL zamienia na kod enuma backendu", () => {
        expect(toReservationQueries(query({ status: "pending" }), 25, TODAY).Status).toBe(0);
        expect(toReservationQueries(query({ status: "approved" }), 25, TODAY).Status).toBe(1);
        expect(toReservationQueries(query({ status: "rejected" }), 25, TODAY).Status).toBe(2);
        expect(toReservationQueries(query({ status: "canceled" }), 25, TODAY).Status).toBe(3);
    });

    it("przepuszcza poprawne id i datę", () => {
        const result = toReservationQueries(
            query({ date: "2026-11-05", building: ID, room: ID, createdBy: ID, page: 3 }),
            25,
            TODAY,
        );
        expect(result).toMatchObject({
            Date: "2026-11-05",
            BuildingId: ID,
            RoomId: ID,
            CreatedById: ID,
            Page: 3,
        });
    });

    it("śmieci z URL nie trafiają do API", () => {
        const result = toReservationQueries(
            query({ status: "toString", date: "2026-02-30", room: "abc", approvedBy: "x" }),
            25,
            TODAY,
        );
        expect(result).toMatchObject({
            Status: undefined,
            Date: undefined,
            RoomId: undefined,
            ApprovedById: undefined,
        });
    });
});

describe("okres listy rezerwacji", () => {
    it("past kończy się wczoraj, all bez zakresu", () => {
        expect(toReservationQueries(query({ when: "past" }), 25, TODAY)).toMatchObject({
            DateTo: "2026-11-10",
        });
        const all = toReservationQueries(query({ when: "all" }), 25, TODAY);
        expect(all).not.toHaveProperty("DateFrom");
        expect(all).not.toHaveProperty("DateTo");
    });

    it("konkretny dzień ma pierwszeństwo przed okresem", () => {
        const result = toReservationQueries(query({ date: "2026-11-05", when: "past" }), 25, TODAY);
        expect(result.Date).toBe("2026-11-05");
        expect(result).not.toHaveProperty("DateFrom");
        expect(result).not.toHaveProperty("DateTo");
    });

    it("przeszłe i wszystkie pokazujemy od najnowszych", () => {
        expect(isPastFirst("past")).toBe(true);
        expect(isPastFirst("all")).toBe(true);
        expect(isPastFirst("")).toBe(false);
        expect(isPastFirst("upcoming")).toBe(false);
    });
});
