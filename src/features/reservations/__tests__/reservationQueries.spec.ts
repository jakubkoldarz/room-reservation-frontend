import { describe, expect, it } from "vitest";
import type { ReservationListQuery } from "../types";
import { toReservationQueries } from "../utils/reservationQueries";

const ID = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";

function query(overrides: Partial<ReservationListQuery> = {}): ReservationListQuery {
    return {
        page: 1,
        status: "",
        date: "",
        building: "",
        room: "",
        createdBy: "",
        approvedBy: "",
        canceledBy: "",
        ...overrides,
    };
}

describe("toReservationQueries", () => {
    it("puste filtry → tylko strona i rozmiar", () => {
        expect(toReservationQueries(query(), 25)).toEqual({
            Status: undefined,
            Date: undefined,
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
        expect(toReservationQueries(query({ status: "pending" }), 25).Status).toBe(0);
        expect(toReservationQueries(query({ status: "approved" }), 25).Status).toBe(1);
        expect(toReservationQueries(query({ status: "rejected" }), 25).Status).toBe(2);
        expect(toReservationQueries(query({ status: "canceled" }), 25).Status).toBe(3);
    });

    it("przepuszcza poprawne id i datę", () => {
        const result = toReservationQueries(
            query({ date: "2026-11-05", building: ID, room: ID, createdBy: ID, page: 3 }),
            25,
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
        );
        expect(result).toMatchObject({
            Status: undefined,
            Date: undefined,
            RoomId: undefined,
            ApprovedById: undefined,
        });
    });
});
