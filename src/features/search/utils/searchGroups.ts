import type { Page } from "@/api/types";
import type { Building } from "@/features/buildings/types";
import { formatAddress } from "@/features/buildings/utils/formatAddres";
import type { RoomListItem } from "@/features/rooms/types";
import { formatFloor } from "@/features/rooms/utils/formatRoom";
import type { SearchGroup, SearchItem, SearchLinks } from "../types";

function roomItems(term: string, rooms: Page<RoomListItem>, links: SearchLinks): SearchItem[] {
    const items: SearchItem[] = rooms.items.map(({ roomInfo, buildingInfo }) => ({
        id: roomInfo.id,
        primary: roomInfo.identifier,
        secondary: `${buildingInfo.name} · ${formatFloor(roomInfo.floor)}`,
        to: links.room(roomInfo),
        isMore: false,
    }));
    if (rooms.totalCount > rooms.items.length) {
        items.push({
            id: "rooms-more",
            primary: `Show all ${rooms.totalCount} rooms`,
            secondary: "",
            to: links.roomList(term),
            isMore: true,
        });
    }
    return items;
}

function buildingItems(term: string, buildings: Page<Building>, links: SearchLinks): SearchItem[] {
    const items: SearchItem[] = buildings.items.map((building) => ({
        id: building.id,
        primary: building.name,
        secondary: formatAddress(building),
        to: links.building(building),
        isMore: false,
    }));
    if (buildings.totalCount > buildings.items.length) {
        items.push({
            id: "buildings-more",
            primary: `Show all ${buildings.totalCount} buildings`,
            secondary: "",
            to: links.buildingList(term),
            isMore: true,
        });
    }
    return items;
}

export function buildSearchGroups(options: {
    term: string;
    rooms: Page<RoomListItem> | null;
    buildings: Page<Building> | null;
    links: SearchLinks;
}): SearchGroup[] {
    const { term, rooms, buildings, links } = options;
    const groups: SearchGroup[] = [
        { key: "rooms", label: "Rooms", items: rooms ? roomItems(term, rooms, links) : [] },
        {
            key: "buildings",
            label: "Buildings",
            items: buildings ? buildingItems(term, buildings, links) : [],
        },
    ];
    return groups.filter((group) => group.items.length > 0);
}
