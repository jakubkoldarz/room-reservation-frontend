import { describe, expect, it } from "vitest";
import type { EventListQuery } from "../types";
import { eventDayCount, eventHours, eventPeriod, formatEventDates } from "../utils/eventFormat";
import { toEventQueries } from "../utils/eventQueries";

const TODAY = new Date(2026, 10, 7);
const ID = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";

function query(overrides: Partial<EventListQuery> = {}): EventListQuery {
    return {
        page: 1,
        name: "",
        when: "",
        date: "",
        building: "",
        room: "",
        type: "",
        sort: "",
        ...overrides,
    };
}

describe("toEventQueries", () => {
    it("domyślnie trwające i nadchodzące (koniec od dziś)", () => {
        expect(toEventQueries(query(), 25, TODAY)).toEqual({
            Name: undefined,
            BuildingId: undefined,
            RoomId: undefined,
            IsClosed: undefined,
            DateFrom: "2026-11-07",
            Page: 1,
            PageSize: 25,
        });
    });

    it("minione kończą się przed dziś, wszystkie bez dat", () => {
        expect(toEventQueries(query({ when: "past" }), 25, TODAY)).toMatchObject({
            DateTo: "2026-11-06",
        });
        const all = toEventQueries(query({ when: "all" }), 25, TODAY);
        expect(all).not.toHaveProperty("DateFrom");
        expect(all).not.toHaveProperty("DateTo");
    });

    it("data „trwa w dniu” ma pierwszeństwo przed okresem", () => {
        expect(
            toEventQueries(query({ when: "past", date: "2026-12-01" }), 25, TODAY),
        ).toMatchObject({
            DateFrom: "2026-12-01",
            DateTo: "2026-12-01",
        });
    });

    it("typ, sala, budynek i nazwa; śmieci z URL odrzucone", () => {
        expect(
            toEventQueries(
                query({ type: "closed", room: ID, building: "x", name: "  Open day " }),
                25,
                TODAY,
            ),
        ).toMatchObject({ IsClosed: true, RoomId: ID, BuildingId: undefined, Name: "Open day" });
        expect(toEventQueries(query({ type: "hours" }), 25, TODAY).IsClosed).toBe(false);
        expect(
            toEventQueries(query({ type: "nope", date: "2026-02-30" }), 25, TODAY),
        ).toMatchObject({
            IsClosed: undefined,
            DateFrom: "2026-11-07",
        });
    });
});

describe("formatowanie eventów", () => {
    it("daty, liczba dni i godziny", () => {
        const event = { startDate: "2026-11-15", endDate: "2026-11-17" };
        expect(formatEventDates(event)).toBe("Sun 15 Nov – Tue 17 Nov 2026");
        expect(formatEventDates({ startDate: "2026-11-15", endDate: "2026-11-15" })).toBe(
            "Sun 15 Nov 2026",
        );
        expect(eventDayCount(event)).toBe(3);
        expect(eventHours({ isClosed: true })).toBe("Closed");
        expect(eventHours({ isClosed: false, startTime: "10:00:00", endTime: "14:00:00" })).toBe(
            "10:00–14:00",
        );
    });

    it("okres względem dzisiejszej daty", () => {
        expect(eventPeriod({ startDate: "2026-11-01", endDate: "2026-11-06" }, "2026-11-07")).toBe(
            "past",
        );
        expect(eventPeriod({ startDate: "2026-11-07", endDate: "2026-11-09" }, "2026-11-07")).toBe(
            "ongoing",
        );
        expect(eventPeriod({ startDate: "2026-11-08", endDate: "2026-11-09" }, "2026-11-07")).toBe(
            "upcoming",
        );
    });
});
