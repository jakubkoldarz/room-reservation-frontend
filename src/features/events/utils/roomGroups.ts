import type { RoomListItem } from "@/features/rooms/types";
import type { BuildingRoomGroup, GroupedRoom } from "../types";

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

function compareGroupsByName(a: BuildingRoomGroup, b: BuildingRoomGroup): number {
    return collator.compare(a.name, b.name);
}

function compareRoomsByIdentifier(a: GroupedRoom, b: GroupedRoom): number {
    return collator.compare(a.identifier, b.identifier);
}

export function groupRoomsByBuilding(
    rooms: readonly RoomListItem[],
    search = "",
): BuildingRoomGroup[] {
    const needle = search.trim().toLowerCase();
    const groupsByBuilding = new Map<string, BuildingRoomGroup>();

    for (const room of rooms) {
        const { roomInfo, buildingInfo } = room;

        const buildingMatches = buildingInfo.name.toLowerCase().includes(needle);
        const roomMatches = roomInfo.identifier.toLowerCase().includes(needle);
        if (needle !== "" && !buildingMatches && !roomMatches) continue;

        let group = groupsByBuilding.get(buildingInfo.id);
        if (!group) {
            group = {
                id: buildingInfo.id,
                name: buildingInfo.name,
                address: `${buildingInfo.street}, ${buildingInfo.city}`,
                rooms: [],
            };
            groupsByBuilding.set(buildingInfo.id, group);
        }

        group.rooms.push({
            id: roomInfo.id,
            identifier: roomInfo.identifier,
            floor: roomInfo.floor,
        });
    }

    const groups = [...groupsByBuilding.values()];
    groups.sort(compareGroupsByName);
    for (const group of groups) {
        group.rooms.sort(compareRoomsByIdentifier);
    }
    return groups;
}

export function selectionState(
    roomIds: readonly string[],
    selected: readonly string[],
): "all" | "some" | "none" {
    let selectedCount = 0;
    for (const id of roomIds) {
        if (selected.includes(id)) selectedCount++;
    }

    if (selectedCount === 0) return "none";
    if (selectedCount === roomIds.length) return "all";
    return "some";
}

export function toggleRooms(
    selected: readonly string[],
    roomIds: readonly string[],
    select: boolean,
): string[] {
    if (!select) {
        return selected.filter((id) => !roomIds.includes(id));
    }

    const result = [...selected];
    for (const id of roomIds) {
        if (!result.includes(id)) result.push(id);
    }
    return result;
}
