import { describe, expect, it } from "vitest";
import type { Page } from "@/api/types";
import type { Building } from "@/features/buildings/types";
import type { RoomListItem } from "@/features/rooms/types";
import type { SearchLinks } from "../types";
import { buildSearchGroups } from "../utils/searchGroups";

const building: Building = {
    id: "b1",
    name: "Main Building",
    identifier: "A",
    street: "Akademicka 2",
    city: "Gliwice",
    postalCode: "44-100",
    floorsCount: 4,
};

function room(id: string, identifier: string, floor: number): RoomListItem {
    return {
        roomInfo: { id, identifier, requiresApproval: false, capacity: 20, floor },
        buildingInfo: building,
        equipment: [],
        availabilities: [],
    };
}

function page<T>(items: T[], totalCount = items.length): Page<T> {
    return { items, totalCount, page: 1, pageSize: 5, totalPages: 1, hasNextPage: false };
}

const links: SearchLinks = {
    room: (info) => `/rooms/${info.id}`,
    building: (info) => `/buildings/${info.id}`,
    roomList: (term) => `/rooms?identifier=${term}`,
    buildingList: (term) => `/buildings?name=${term}`,
};

describe("buildSearchGroups", () => {
    it("sale i budynki jako osobne grupy z linkami do szczegółów", () => {
        const groups = buildSearchGroups({
            term: "a",
            rooms: page([room("r1", "A-101", 1)]),
            buildings: page([building]),
            links,
        });

        expect(groups).toEqual([
            {
                key: "rooms",
                label: "Rooms",
                items: [
                    {
                        id: "r1",
                        primary: "A-101",
                        secondary: "Main Building · Floor 1",
                        to: "/rooms/r1",
                        isMore: false,
                    },
                ],
            },
            {
                key: "buildings",
                label: "Buildings",
                items: [
                    {
                        id: "b1",
                        primary: "Main Building",
                        secondary: "Akademicka 2, 44-100 Gliwice",
                        to: "/buildings/b1",
                        isMore: false,
                    },
                ],
            },
        ]);
    });

    it("gdy wyników jest więcej, dokłada pozycję prowadzącą do przefiltrowanej listy", () => {
        const groups = buildSearchGroups({
            term: "a-1",
            rooms: page([room("r1", "A-101", 1)], 12),
            buildings: page([building], 4),
            links,
        });

        expect(groups[0]?.items[1]).toEqual({
            id: "rooms-more",
            primary: "Show all 12 rooms",
            secondary: "",
            to: "/rooms?identifier=a-1",
            isMore: true,
        });
        expect(groups[1]?.items[1]).toMatchObject({
            primary: "Show all 4 buildings",
            to: "/buildings?name=a-1",
            isMore: true,
        });
    });

    it("pomija puste grupy i brak danych", () => {
        expect(
            buildSearchGroups({
                term: "x",
                rooms: page<RoomListItem>([]),
                buildings: null,
                links,
            }),
        ).toEqual([]);

        const onlyBuildings = buildSearchGroups({
            term: "main",
            rooms: page<RoomListItem>([]),
            buildings: page([building]),
            links,
        });
        expect(onlyBuildings.map((group) => group.key)).toEqual(["buildings"]);
    });
});
