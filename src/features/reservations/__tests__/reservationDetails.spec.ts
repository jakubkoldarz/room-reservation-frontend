import { describe, expect, it } from "vitest";
import type { Reservation } from "../types";
import { reservationDetailRows } from "../utils/reservationDetails";

const ANNA = { id: "6f1c2a3e-1b2c-4d5e-8f90-123456789abc", firstname: "Anna", lastname: "Nowak" };
const JAN = { id: "7f1c2a3e-1b2c-4d5e-8f90-123456789abc", firstname: "Jan", lastname: "Kowalski" };

function reservation(overrides: Partial<Reservation> = {}): Reservation {
    return {
        id: "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b",
        createdBy: { at: "2026-11-03T10:15:00", by: ANNA },
        date: "2026-11-05",
        startTime: "13:00:00",
        endTime: "15:00:00",
        ...overrides,
    };
}

describe("reservationDetailRows", () => {
    it("każda informacja w osobnym wierszu, z salą i autorem", () => {
        expect(reservationDetailRows(reservation(), "pending", "A-101 · Main Building")).toEqual([
            { label: "Date", value: "Thu, 5 Nov 2026" },
            { label: "Time", value: "13:00–15:00" },
            { label: "Room", value: "A-101 · Main Building" },
            { label: "Booked by", value: "Anna Nowak, 3 Nov 2026, 10:15" },
        ]);
    });

    it("odrzucona: kto odrzucił, cel i powód odrzucenia", () => {
        const rows = reservationDetailRows(
            reservation({
                purpose: "Movie night",
                reason: "Exam week",
                rejectedBy: { at: "2026-11-04T09:00:00", by: JAN },
            }),
            "rejected",
            null,
        );
        expect(rows.map((row) => row.label)).toEqual([
            "Date",
            "Time",
            "Booked by",
            "Rejected by",
            "Purpose",
            "Rejection reason",
        ]);
        expect(rows[3].value).toBe("Jan Kowalski, 4 Nov 2026, 09:00");
        expect(rows[5].value).toBe("Exam week");
    });
});
