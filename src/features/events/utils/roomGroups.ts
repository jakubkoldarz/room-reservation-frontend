import type { RoomListItem } from "@/features/rooms/types";
import type { BuildingRoomGroup } from "../types";

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

export function groupRoomsByBuilding(
    rooms: readonly RoomListItem[],
    search = "",
): BuildingRoomGroup[] {
    const needle = search.trim().toLowerCase();
    const groups = new Map<string, BuildingRoomGroup>();

    for (const { roomInfo, buildingInfo } of rooms) {
        const buildingMatches = buildingInfo.name.toLowerCase().includes(needle);
        const roomMatches = roomInfo.identifier.toLowerCase().includes(needle);
        if (needle && !buildingMatches && !roomMatches) continue;

        const group = groups.get(buildingInfo.id) ?? {
            id: buildingInfo.id,
            name: buildingInfo.name,
            address: `${buildingInfo.street}, ${buildingInfo.city}`,
            rooms: [],
        };
        group.rooms.push({
            id: roomInfo.id,
            identifier: roomInfo.identifier,
            floor: roomInfo.floor,
        });
        groups.set(buildingInfo.id, group);
    }

    return [...groups.values()]
        .map((group) => ({
            ...group,
            rooms: group.rooms.sort((a, b) => collator.compare(a.identifier, b.identifier)),
        }))
        .sort((a, b) => collator.compare(a.name, b.name));
}

export function selectionState(
    roomIds: readonly string[],
    selected: readonly string[],
): "all" | "some" | "none" {
    const count = roomIds.filter((id) => selected.includes(id)).length;
    if (count === 0) return "none";
    return count === roomIds.length ? "all" : "some";
}

export function toggleRooms(
    selected: readonly string[],
    roomIds: readonly string[],
    select: boolean,
): string[] {
    if (select) return [...new Set([...selected, ...roomIds])];
    return selected.filter((id) => !roomIds.includes(id));
}
