import { describe, expect, it } from "vitest";
import type { Reservation, ReservationState } from "@/features/reservations/types";
import type { CalendarBlock, CalendarDay } from "../types";
import { hoverMinute, rangeFromClick, rangeFromDrag, selectableBounds } from "../utils/selection";

function block(start: number, end: number, kind: ReservationState = "approved"): CalendarBlock {
    return {
        id: `${start}-${end}`,
        kind,
        start,
        end,
        time: "",
        title: "",
        detail: "",
        reservation: {} as Reservation,
        room: null,
        lane: 0,
        lanes: 1,
    };
}

function day(blocks: CalendarBlock[] = []): CalendarDay {
    return {
        date: new Date(2026, 10, 9),
        iso: "2026-11-09",
        isToday: false,
        openIntervals: [{ start: 480, end: 960 }],
        allDay: [],
        blocks,
        grid: { blocks, more: [] },
    };
}

describe("selectableBounds", () => {
    it("w otwartym dniu bez rezerwacji → całe godziny otwarcia", () => {
        expect(selectableBounds(day(), 600, 0)).toEqual({ start: 480, end: 960 });
    });

    it("poza godzinami otwarcia albo w przeszłości → brak zaznaczenia", () => {
        expect(selectableBounds(day(), 420, 0)).toBeNull();
        expect(selectableBounds(day(), 600, 610)).toBeNull();
    });

    it("dzisiaj zaczyna od najbliższego pełnego kwadransu po teraz", () => {
        expect(selectableBounds(day(), 700, 607)).toEqual({ start: 615, end: 960 });
    });

    it("aktywne rezerwacje ograniczają zakres, anulowane i odrzucone nie", () => {
        const blocks = [block(540, 600), block(720, 780, "pending"), block(620, 660, "canceled")];
        expect(selectableBounds(day(blocks), 640, 0)).toEqual({ start: 600, end: 720 });
        expect(selectableBounds(day(blocks), 560, 0)).toBeNull();
    });
});

describe("zaznaczanie", () => {
    const bounds = { start: 480, end: 720 };

    it("kliknięcie → godzina od kwadransu, przycięta do zakresu", () => {
        expect(rangeFromClick(547, bounds)).toEqual({ start: 540, end: 600 });
        expect(rangeFromClick(700, bounds)).toEqual({ start: 690, end: 720 });
    });

    it("przeciąganie w dół zaokrągla koniec w górę, w górę przesuwa początek", () => {
        expect(rangeFromDrag(540, 611, bounds)).toEqual({ start: 540, end: 615 });
        expect(rangeFromDrag(540, 800, bounds)).toEqual({ start: 540, end: 720 });
        expect(rangeFromDrag(600, 512, bounds)).toEqual({ start: 510, end: 615 });
        expect(rangeFromDrag(600, 300, bounds)).toEqual({ start: 480, end: 615 });
    });
});

describe("hoverMinute", () => {
    it("pokazuje kwadrans pod kursorem tylko tam, gdzie da się zacząć rezerwację", () => {
        const blocks = [block(600, 660)];
        expect(hoverMinute(day(blocks), 557, 0)).toBe(555);
        expect(hoverMinute(day(blocks), 620, 0)).toBeNull();
        expect(hoverMinute(day(blocks), 1000, 0)).toBeNull();
    });

    it("dzisiaj nie cofa się przed najbliższy wolny kwadrans", () => {
        expect(hoverMinute(day(), 610, 607)).toBe(615);
    });
});
