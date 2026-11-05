import { describe, expect, it } from "vitest";
import type { RoomListQuery } from "../types";
import { timeRangeError, toRoomQueries } from "../utils/roomQueries";

const ID_A = "6f1c2a3e-1b2c-4d5e-8f90-123456789abc";
const ID_B = "7a2b3c4d-5e6f-4a1b-9c2d-abcdef012345";

function query(overrides: Partial<RoomListQuery> = {}): RoomListQuery {
    return {
        page: 1,
        identifier: "",
        building: "",
        floor: "",
        capacity: "",
        equipment: "",
        day: "",
        from: "",
        to: "",
        ...overrides,
    };
}

describe("toRoomQueries", () => {
    it("puste filtry nie wysyłają żadnych parametrów poza stronicowaniem", () => {
        expect(toRoomQueries(query({ page: 2 }), 25)).toEqual({
            Identifier: undefined,
            BuildingId: undefined,
            Floor: undefined,
            MinCapacity: undefined,
            DayOfWeek: undefined,
            StartTime: undefined,
            EndTime: undefined,
            EquipmentIds: undefined,
            Page: 2,
            PageSize: 25,
        });
    });

    it("poprawne wartości są konwertowane na typy API", () => {
        const result = toRoomQueries(
            query({
                identifier: "  A-1 ",
                building: ID_A,
                floor: "-1",
                capacity: "30",
                equipment: `${ID_A},${ID_B}`,
                day: "0",
                from: "08:00",
                to: "16:30",
            }),
            25,
        );
        expect(result).toMatchObject({
            Identifier: "A-1",
            BuildingId: ID_A,
            Floor: -1,
            MinCapacity: 30,
            DayOfWeek: 0,
            StartTime: "08:00",
            EndTime: "16:30",
            EquipmentIds: [ID_A, ID_B],
        });
    });

    it("śmieci z URL są pomijane zamiast psuć zapytanie", () => {
        const result = toRoomQueries(
            query({
                building: "not-a-uuid",
                floor: "1.5",
                capacity: "0",
                equipment: `abc,${ID_B},`,
                day: "7",
                from: "25:00",
                to: "9:00",
            }),
            25,
        );
        expect(result).toMatchObject({
            BuildingId: undefined,
            Floor: undefined,
            MinCapacity: undefined,
            DayOfWeek: undefined,
            StartTime: undefined,
            EndTime: undefined,
            EquipmentIds: [ID_B],
        });
    });

    it("godziny są wysyłane tylko w parze i gdy początek jest przed końcem", () => {
        const onlyFrom = toRoomQueries(query({ from: "08:00" }), 25);
        expect(onlyFrom).toMatchObject({ StartTime: undefined, EndTime: undefined });

        const onlyTo = toRoomQueries(query({ to: "16:00" }), 25);
        expect(onlyTo).toMatchObject({ StartTime: undefined, EndTime: undefined });

        const reversed = toRoomQueries(query({ from: "16:00", to: "08:00" }), 25);
        expect(reversed).toMatchObject({ StartTime: undefined, EndTime: undefined });

        const equal = toRoomQueries(query({ from: "10:00", to: "10:00" }), 25);
        expect(equal).toMatchObject({ StartTime: undefined, EndTime: undefined });
    });
});

describe("timeRangeError", () => {
    it("brak godzin albo poprawny przedział → brak błędu", () => {
        expect(timeRangeError(query())).toBeNull();
        expect(timeRangeError(query({ from: "08:00", to: "16:00" }))).toBeNull();
    });

    it("tylko jedna godzina → prośba o obie", () => {
        expect(timeRangeError(query({ from: "08:00" }))).toMatch(/both/);
        expect(timeRangeError(query({ to: "16:00" }))).toMatch(/both/);
    });

    it("początek nie przed końcem → błąd kolejności", () => {
        expect(timeRangeError(query({ from: "16:00", to: "08:00" }))).toMatch(/earlier/);
        expect(timeRangeError(query({ from: "10:00", to: "10:00" }))).toMatch(/earlier/);
    });
});
