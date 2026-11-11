import { describe, expect, it } from "vitest";
import type { RoomListItem } from "@/features/rooms/types";
import { groupRoomsByBuilding, selectionState, toggleRooms } from "../utils/roomGroups";

function room(
    id: string,
    identifier: string,
    buildingId: string,
    buildingName: string,
): RoomListItem {
    return {
        roomInfo: { id, identifier, floor: 1, capacity: 20, requiresApproval: false },
        buildingInfo: {
            id: buildingId,
            name: buildingName,
            identifier: null,
            street: "Narutowicza 11",
            city: "Gdańsk",
            postalCode: "80-233",
            floorsCount: 3,
        },
        equipment: [],
        availabilities: [],
    } as RoomListItem;
}

const ROOMS = [
    room("r3", "A-110", "b1", "Main Building"),
    room("r1", "A-12", "b1", "Main Building"),
    room("r2", "Lab 3", "b2", "Electronics"),
    room("r4", "A-2", "b1", "Main Building"),
];

describe("groupRoomsByBuilding", () => {
    it("grupuje po budynku i sortuje naturalnie (A-2 przed A-12 przed A-110)", () => {
        const groups = groupRoomsByBuilding(ROOMS);
        expect(groups.map((group) => group.name)).toEqual(["Electronics", "Main Building"]);
        expect(groups[1].rooms.map((r) => r.identifier)).toEqual(["A-2", "A-12", "A-110"]);
        expect(groups[1].address).toBe("Narutowicza 11, Gdańsk");
    });

    it("szuka po sali albo po nazwie budynku", () => {
        expect(groupRoomsByBuilding(ROOMS, "lab").map((g) => g.name)).toEqual(["Electronics"]);
        const byBuilding = groupRoomsByBuilding(ROOMS, "main");
        expect(byBuilding).toHaveLength(1);
        expect(byBuilding[0].rooms).toHaveLength(3);
        expect(groupRoomsByBuilding(ROOMS, "a-1")[0].rooms.map((r) => r.id)).toEqual(["r1", "r3"]);
    });
});

describe("zaznaczanie sal", () => {
    it("stan budynku: wszystkie, część, żadna", () => {
        expect(selectionState(["r1", "r3"], ["r1", "r3", "r2"])).toBe("all");
        expect(selectionState(["r1", "r3"], ["r1"])).toBe("some");
        expect(selectionState(["r1", "r3"], ["r2"])).toBe("none");
    });

    it("zaznacza cały budynek bez duplikatów i odznacza tylko jego sale", () => {
        expect(toggleRooms(["r1", "r2"], ["r1", "r3"], true)).toEqual(["r1", "r2", "r3"]);
        expect(toggleRooms(["r1", "r2", "r3"], ["r1", "r3"], false)).toEqual(["r2"]);
    });
});
