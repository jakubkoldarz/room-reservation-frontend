import { describe, expect, it } from "vitest";
import { groupPermissions } from "../utils/permissions";
import { hasStarted, myReservationAction, toMyReservationQueries } from "../utils/myReservations";

const NOW = new Date(2026, 10, 11, 14, 0);
const QUERY = { page: 1, when: "", status: "", sort: "" };

describe("toMyReservationQueries", () => {
    it("domyślnie pokazuje dzisiejsze i przyszłe rezerwacje", () => {
        expect(toMyReservationQueries(QUERY, 25, NOW)).toEqual({
            Status: undefined,
            DateFrom: "2026-11-11",
            Page: 1,
            PageSize: 25,
        });
    });

    it("„past” kończy się na wczoraj, „all” nie ma zakresu dat", () => {
        expect(toMyReservationQueries({ ...QUERY, when: "past" }, 25, NOW)).toMatchObject({
            DateTo: "2026-11-10",
        });
        const all = toMyReservationQueries({ ...QUERY, when: "all" }, 25, NOW);
        expect(all).not.toHaveProperty("DateFrom");
        expect(all).not.toHaveProperty("DateTo");
    });

    it("zamienia status na kod enuma i pomija śmieci z URL", () => {
        expect(toMyReservationQueries({ ...QUERY, status: "canceled" }, 25, NOW).Status).toBe(3);
        expect(toMyReservationQueries({ ...QUERY, status: "abc" }, 25, NOW).Status).toBeUndefined();
    });
});

describe("hasStarted", () => {
    it("porównuje datę, a dla dzisiejszej godzinę początku", () => {
        expect(hasStarted({ date: "2026-11-10", startTime: "18:00:00" }, NOW)).toBe(true);
        expect(hasStarted({ date: "2026-11-11", startTime: "13:30:00" }, NOW)).toBe(true);
        expect(hasStarted({ date: "2026-11-11", startTime: "14:00:00" }, NOW)).toBe(true);
        expect(hasStarted({ date: "2026-11-11", startTime: "14:15:00" }, NOW)).toBe(false);
        expect(hasStarted({ date: "2026-11-12", startTime: "08:00:00" }, NOW)).toBe(false);
    });
});

describe("myReservationAction", () => {
    const later = { date: "2026-11-12", startTime: "10:00:00" };

    it("oczekującą można wycofać, potwierdzoną anulować", () => {
        expect(myReservationAction("pending", later, NOW)).toBe("withdraw");
        expect(myReservationAction("approved", later, NOW)).toBe("cancel");
    });

    it("brak akcji dla odrzuconych, anulowanych i już rozpoczętych", () => {
        expect(myReservationAction("rejected", later, NOW)).toBeNull();
        expect(myReservationAction("canceled", later, NOW)).toBeNull();
        expect(
            myReservationAction("approved", { date: "2026-11-11", startTime: "09:00:00" }, NOW),
        ).toBeNull();
    });
});

describe("groupPermissions", () => {
    it("grupuje po obszarze w stałej kolejności i nazywa akcje", () => {
        expect(
            groupPermissions([
                "room.edit",
                "reservation.force.cancel",
                "room.view",
                "reservation.create",
                "custom.thing",
            ]),
        ).toEqual([
            { area: "Reservations", actions: ["Book", "Cancel any"] },
            { area: "Rooms", actions: ["View", "Edit"] },
            { area: "Custom", actions: ["Thing"] },
        ]);
    });

    it("pomija niepełne wpisy i duplikaty", () => {
        expect(groupPermissions(["room", "room.view", "room.view"])).toEqual([
            { area: "Rooms", actions: ["View"] },
        ]);
    });
});
