import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEventFormSchema, EventFormSchema } from "../schemas";
import { toEventRequest } from "../utils/eventConflicts";

function issues(input: Record<string, unknown>) {
    const result = EventFormSchema.safeParse(input);
    return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
}

describe("EventFormSchema", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 10, 7, 12));
    });

    afterEach(() => vi.useRealTimers());

    it("zamknięty event nie wymaga godzin", () => {
        expect(
            issues({
                name: "Renovation",
                startDate: "2026-11-10",
                endDate: "2026-11-12",
                isClosed: true,
            }),
        ).toEqual([]);
    });

    it("specjalne godziny wymagają obu godzin i końca po początku", () => {
        const base = {
            name: "Open day",
            startDate: "2026-11-10",
            endDate: "2026-11-10",
            isClosed: false,
        };
        expect(issues(base)).toEqual(["startTime", "endTime"]);
        expect(issues({ ...base, startTime: "14:00", endTime: "10:00" })).toEqual(["endTime"]);
        expect(issues({ ...base, startTime: "10:00", endTime: "14:00" })).toEqual([]);
    });

    it("data początku nie w przeszłości, koniec nie przed początkiem", () => {
        expect(
            issues({ name: "X", startDate: "2026-11-06", endDate: "2026-11-08", isClosed: true }),
        ).toEqual(["startDate"]);
        expect(
            issues({ name: "X", startDate: "2026-11-10", endDate: "2026-11-09", isClosed: true }),
        ).toEqual(["endDate"]);
    });

    it("edycja trwającego eventu: stara data początku zostaje, ale koniec nie w przeszłości", () => {
        const schema = createEventFormSchema("2026-11-05");
        const parse = (input: Record<string, unknown>) => {
            const result = schema.safeParse(input);
            return result.success ? [] : result.error.issues.map((issue) => issue.path.join("."));
        };
        const ongoing = {
            name: "X",
            startDate: "2026-11-05",
            endDate: "2026-11-09",
            isClosed: true,
        };
        expect(parse(ongoing)).toEqual([]);
        expect(parse({ ...ongoing, startDate: "2026-11-04" })).toEqual(["startDate"]);
        expect(parse({ ...ongoing, endDate: "2026-11-06" })).toEqual(["endDate"]);
    });
});

describe("toEventRequest", () => {
    it("zamknięty wysyła null zamiast godzin, otwarty dopisuje sekundy", () => {
        const closed = {
            name: "X",
            startDate: "2026-11-10",
            endDate: "2026-11-10",
            isClosed: true,
        };
        expect(toEventRequest(closed, ["r1"])).toMatchObject({
            startTime: null,
            endTime: null,
            roomIds: ["r1"],
        });
        expect(
            toEventRequest(
                { ...closed, isClosed: false, startTime: "10:00", endTime: "14:00" },
                [],
            ),
        ).toMatchObject({ startTime: "10:00:00", endTime: "14:00:00" });
    });
});
