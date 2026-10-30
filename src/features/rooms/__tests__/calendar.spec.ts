import { describe, expect, it } from "vitest";
import type { EventInfo } from "@/features/events/types";
import type { Reservation } from "@/features/reservations/types";
import {
    addDays,
    buildCalendarDays,
    formatWeekRange,
    hourRange,
    layoutLanes,
    parseIsoDate,
    startOfWeek,
    toIsoDate,
} from "../utils/calendar";

const MONDAY = new Date(2026, 10, 2);
const USER = { id: "6f1c2a3e-1b2c-4d5e-8f90-123456789abc", firstname: "Anna", lastname: "Nowak" };

function reservation(overrides: Partial<Reservation> = {}): Reservation {
    return {
        id: crypto.randomUUID(),
        createdBy: { at: "2026-10-30T10:00:00+01:00", by: USER },
        date: "2026-11-02",
        startTime: "10:00:00",
        endTime: "12:00:00",
        purpose: "Lecture",
        ...overrides,
    };
}

function event(overrides: Partial<EventInfo> = {}): EventInfo {
    return {
        id: crypto.randomUUID(),
        name: "Open day",
        startDate: "2026-11-03",
        endDate: "2026-11-04",
        isClosed: false,
        rooms: [],
        ...overrides,
    };
}

describe("daty tygodnia", () => {
    it("tydzień zaczyna się w poniedziałek, także dla niedzieli", () => {
        expect(toIsoDate(startOfWeek(new Date(2026, 10, 5, 15)))).toBe("2026-11-02");
        expect(toIsoDate(startOfWeek(new Date(2026, 10, 8)))).toBe("2026-11-02");
        expect(toIsoDate(startOfWeek(MONDAY))).toBe("2026-11-02");
    });

    it("addDays przechodzi przez granicę miesiąca", () => {
        expect(toIsoDate(addDays(new Date(2026, 10, 30), 2))).toBe("2026-12-02");
    });

    it("parseIsoDate odrzuca śmieci i nieistniejące daty", () => {
        expect(parseIsoDate("2026-11-02")?.getDate()).toBe(2);
        expect(parseIsoDate("2026-02-30")).toBeNull();
        expect(parseIsoDate("abc")).toBeNull();
        expect(parseIsoDate(undefined)).toBeNull();
    });

    it("formatWeekRange skraca zakres w obrębie miesiąca i roku", () => {
        expect(formatWeekRange(MONDAY)).toBe("2 – 8 Nov 2026");
        expect(formatWeekRange(new Date(2026, 10, 30))).toBe("30 Nov – 6 Dec 2026");
        expect(formatWeekRange(new Date(2026, 11, 28))).toBe("28 Dec 2026 – 3 Jan 2027");
    });
});

describe("layoutLanes", () => {
    it("nienachodzące bloki mają po jednym pasie", () => {
        const result = layoutLanes([
            { start: 60, end: 120 },
            { start: 120, end: 180 },
        ]);
        expect(result.map((r) => [r.lane, r.lanes])).toEqual([
            [0, 1],
            [0, 1],
        ]);
    });

    it("nachodzące bloki dzielą się na pasy w obrębie grupy", () => {
        const result = layoutLanes([
            { start: 60, end: 180 },
            { start: 90, end: 120 },
            { start: 130, end: 200 },
            { start: 300, end: 360 },
        ]);
        expect(result.map((r) => [r.start, r.lane, r.lanes])).toEqual([
            [60, 0, 2],
            [90, 1, 2],
            [130, 1, 2],
            [300, 0, 1],
        ]);
    });
});

describe("buildCalendarDays", () => {
    const base = {
        weekStart: MONDAY,
        now: new Date(2026, 10, 2, 11),
        reservations: [] as Reservation[],
        events: [] as EventInfo[],
        availabilities: [{ dayOfWeek: 1, startTime: "08:00:00", endTime: "16:00:00" }],
        requiresApproval: true,
    };

    it("zwraca 7 dni od poniedziałku z dzisiejszym dniem i godzinami otwarcia", () => {
        const days = buildCalendarDays(base);
        expect(days.map((d) => d.iso)).toEqual([
            "2026-11-02",
            "2026-11-03",
            "2026-11-04",
            "2026-11-05",
            "2026-11-06",
            "2026-11-07",
            "2026-11-08",
        ]);
        expect(days[0].isToday).toBe(true);
        expect(days[0].openIntervals).toEqual([{ start: 480, end: 960 }]);
        expect(days[1].openIntervals).toEqual([]);
    });

    it("rezerwacja trafia do swojego dnia ze statusem i opisem", () => {
        const days = buildCalendarDays({
            ...base,
            reservations: [reservation({ approvedBy: { at: "2026-10-31T09:00:00Z", by: USER } })],
        });
        expect(days[0].blocks).toHaveLength(1);
        expect(days[0].blocks[0]).toMatchObject({
            kind: "approved",
            start: 600,
            end: 720,
            time: "10:00–12:00",
            title: "Anna Nowak",
            detail: "Lecture",
        });
        expect(days[0].blocks[0].tooltip).toContain("Confirmed");
    });

    it("wydarzenie z godzinami to blok w każdym dniu zakresu, bez godzin to wpis całodniowy", () => {
        const days = buildCalendarDays({
            ...base,
            events: [
                event({ startTime: "09:00:00", endTime: "11:00:00" }),
                event({
                    name: "Renovation",
                    isClosed: true,
                    startDate: "2026-11-06",
                    endDate: "2026-11-06",
                }),
            ],
        });
        expect(days[1].blocks[0]).toMatchObject({ kind: "event", time: "09:00–11:00" });
        expect(days[2].blocks[0]).toMatchObject({ kind: "event" });
        expect(days[3].blocks).toHaveLength(0);
        expect(days[4].allDay).toEqual([
            expect.objectContaining({ title: "Renovation", isClosed: true }),
        ]);
    });
});

describe("hourRange", () => {
    it("obejmuje godziny otwarcia i bloki, z zaokrągleniem do pełnych godzin", () => {
        const days = buildCalendarDays({
            weekStart: MONDAY,
            now: MONDAY,
            reservations: [reservation({ startTime: "07:30:00", endTime: "08:30:00" })],
            events: [],
            availabilities: [{ dayOfWeek: 1, startTime: "08:00:00", endTime: "16:15:00" }],
            requiresApproval: false,
        });
        expect(
            hourRange([{ dayOfWeek: 1, startTime: "08:00:00", endTime: "16:15:00" }], days),
        ).toEqual({
            start: 7,
            end: 17,
        });
    });

    it("bez danych → domyślnie 8–18", () => {
        expect(hourRange([], [])).toEqual({ start: 8, end: 18 });
    });
});
