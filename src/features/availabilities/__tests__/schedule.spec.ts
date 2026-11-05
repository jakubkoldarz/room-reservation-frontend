import { describe, expect, it } from "vitest";
import type { EventInfo } from "@/features/events/types";
import type { Availability } from "../types";
import {
    describeDay,
    describeOpenStatus,
    formatHm,
    getOpenStatus,
    groupWeek,
    slotsForDate,
    slotsForDay,
} from "../utils/schedule";

const MONDAY = 1;
const TUESDAY = 2;
const FRIDAY = 5;

function slot(dayOfWeek: number, startTime: string, endTime: string): Availability {
    return { dayOfWeek, startTime, endTime };
}

function monday(hours: number, minutes = 0): Date {
    return new Date(2026, 10, 2, hours, minutes);
}

const weekdays = [MONDAY, TUESDAY, 3, 4, FRIDAY].map((day) => slot(day, "08:00:00", "16:00:00"));

function event(overrides: Partial<EventInfo> = {}): EventInfo {
    return {
        id: "event-1",
        name: "Open day",
        startDate: "2026-11-02",
        endDate: "2026-11-02",
        isClosed: false,
        rooms: [],
        ...overrides,
    };
}

describe("formatHm", () => {
    it("obcina sekundy i dopełnia zera", () => {
        expect(formatHm("08:00:00")).toBe("08:00");
        expect(formatHm("9:5")).toBe("09:05");
    });
});

describe("slotsForDay", () => {
    it("zwraca sloty danego dnia posortowane po godzinie", () => {
        const items = [
            slot(MONDAY, "13:00", "15:00"),
            slot(TUESDAY, "08:00", "09:00"),
            slot(MONDAY, "08:00", "12:00"),
        ];
        expect(slotsForDay(items, MONDAY).map((s) => s.startTime)).toEqual(["08:00", "13:00"]);
    });
});

describe("describeDay", () => {
    it("opisuje godziny albo zamknięcie", () => {
        expect(describeDay(weekdays, MONDAY)).toBe("Monday: 08:00–16:00");
        expect(describeDay(weekdays, 0)).toBe("Sunday: closed");
    });
});

describe("groupWeek", () => {
    const summary = (items: Availability[]) =>
        groupWeek(items).map(({ days, ranges }) => `${days} ${ranges.join(", ")}`);

    it("łączy kolejne dni z tymi samymi godzinami w zakres", () => {
        const items = [...weekdays, slot(6, "09:00", "13:00")];
        expect(summary(items)).toEqual(["Mon–Fri 08:00–16:00", "Sat 09:00–13:00"]);
    });

    it("zamknięty dzień przerywa zakres", () => {
        const items = [slot(MONDAY, "08:00", "16:00"), slot(3, "08:00", "16:00")];
        expect(summary(items)).toEqual(["Mon 08:00–16:00", "Wed 08:00–16:00"]);
    });

    it("niedziela jest na końcu tygodnia", () => {
        const items = [slot(6, "10:00", "14:00"), slot(0, "10:00", "14:00")];
        expect(summary(items)).toEqual(["Sat–Sun 10:00–14:00"]);
    });

    it("kilka slotów w dniu jako osobne przedziały, brak dostępności to pusta lista", () => {
        const split = [slot(MONDAY, "13:00", "17:00"), slot(MONDAY, "08:00", "12:00")];
        expect(groupWeek(split)).toEqual([
            {
                key: "1-08:00–12:00, 13:00–17:00",
                days: "Mon",
                ranges: ["08:00–12:00", "13:00–17:00"],
            },
        ]);
        expect(groupWeek([])).toEqual([]);
    });
});

describe("getOpenStatus", () => {
    it("w trakcie godzin otwarcia → open do końca slotu", () => {
        expect(getOpenStatus(weekdays, monday(10))).toEqual({ kind: "open", until: "16:00" });
    });

    it("przed otwarciem → otwiera się dziś", () => {
        expect(getOpenStatus(weekdays, monday(7, 30))).toEqual({
            kind: "opens",
            dayOfWeek: MONDAY,
            daysAhead: 0,
            at: "08:00",
        });
    });

    it("koniec slotu jest wyłączny → po 16:00 otwiera się jutro", () => {
        expect(getOpenStatus(weekdays, monday(16))).toEqual({
            kind: "opens",
            dayOfWeek: TUESDAY,
            daysAhead: 1,
            at: "08:00",
        });
    });

    it("piątek wieczorem → otwiera się w poniedziałek", () => {
        const fridayEvening = new Date(2026, 10, 6, 20, 0);
        expect(getOpenStatus(weekdays, fridayEvening)).toEqual({
            kind: "opens",
            dayOfWeek: MONDAY,
            daysAhead: 3,
            at: "08:00",
        });
    });

    it("przerwa między slotami → otwiera się dziś ponownie", () => {
        const split = [slot(MONDAY, "08:00", "12:00"), slot(MONDAY, "13:00", "17:00")];
        expect(getOpenStatus(split, monday(12, 30))).toMatchObject({
            kind: "opens",
            daysAhead: 0,
            at: "13:00",
        });
    });

    it("tylko dzisiejszy, już miniony slot → otwiera się za tydzień", () => {
        const onlyMonday = [slot(MONDAY, "08:00", "09:00")];
        expect(getOpenStatus(onlyMonday, monday(10))).toMatchObject({
            kind: "opens",
            daysAhead: 7,
        });
    });

    it("brak dostępności → never", () => {
        expect(getOpenStatus([], monday(10))).toEqual({ kind: "never" });
    });

    it("wydarzenie zamykające dziś → zamknięte mimo zwykłych godzin, otwiera się jutro", () => {
        expect(getOpenStatus(weekdays, monday(10), [event({ isClosed: true })])).toMatchObject({
            kind: "opens",
            daysAhead: 1,
            at: "08:00",
        });
    });

    it("wydarzenie z godzinami zastępuje zwykłe godziny", () => {
        const special = event({ startTime: "12:00:00", endTime: "20:00:00" });
        expect(getOpenStatus(weekdays, monday(18), [special])).toEqual({
            kind: "open",
            until: "20:00",
        });
        expect(getOpenStatus(weekdays, monday(10), [special])).toMatchObject({
            kind: "opens",
            daysAhead: 0,
            at: "12:00",
        });
    });

    it("dłuższe zamknięcie → szuka otwarcia dalej niż tydzień", () => {
        const renovation = event({
            isClosed: true,
            startDate: "2026-11-02",
            endDate: "2026-11-20",
        });
        expect(getOpenStatus(weekdays, monday(10), [renovation])).toMatchObject({
            kind: "opens",
            daysAhead: 21,
        });
    });
});

describe("slotsForDate", () => {
    it("bez wydarzenia → zwykłe godziny dnia tygodnia", () => {
        expect(slotsForDate(weekdays, monday(0))).toEqual([slot(MONDAY, "08:00:00", "16:00:00")]);
    });

    it("wydarzenie otwiera pokój także w dzień normalnie zamknięty", () => {
        const sunday = new Date(2026, 10, 8);
        const special = event({
            startDate: "2026-11-08",
            endDate: "2026-11-08",
            startTime: "10:00:00",
            endTime: "14:00:00",
        });
        expect(slotsForDate(weekdays, sunday, [special])).toEqual([
            slot(0, "10:00:00", "14:00:00"),
        ]);
    });

    it("wydarzenie zamknięte → brak godzin", () => {
        expect(slotsForDate(weekdays, monday(0), [event({ isClosed: true })])).toEqual([]);
    });
});

describe("describeOpenStatus", () => {
    it("tworzy krótki opis statusu", () => {
        expect(describeOpenStatus({ kind: "open", until: "16:00" })).toBe("Open now · until 16:00");
        expect(describeOpenStatus({ kind: "opens", dayOfWeek: 1, daysAhead: 0, at: "08:00" })).toBe(
            "Closed · opens today 08:00",
        );
        expect(describeOpenStatus({ kind: "opens", dayOfWeek: 2, daysAhead: 1, at: "08:00" })).toBe(
            "Closed · opens tomorrow 08:00",
        );
        expect(describeOpenStatus({ kind: "opens", dayOfWeek: 1, daysAhead: 3, at: "08:00" })).toBe(
            "Closed · opens Mon 08:00",
        );
        expect(
            describeOpenStatus({ kind: "opens", dayOfWeek: 1, daysAhead: 21, at: "08:00" }),
        ).toBe("Closed · opens in 21 days 08:00");
        expect(describeOpenStatus({ kind: "never" })).toBe("No opening hours");
    });
});
