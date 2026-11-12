import type { RouteLocationRaw } from "vue-router";
import type { Building } from "@/features/buildings/types";
import type { BasicRoom } from "@/features/rooms/types";

export type SearchItem = {
    id: string;
    primary: string;
    secondary: string;
    to: RouteLocationRaw;
    isMore: boolean;
};

export type SearchGroup = {
    key: "rooms" | "buildings";
    label: string;
    items: SearchItem[];
};

export type SearchLinks = {
    room(room: BasicRoom): RouteLocationRaw;
    building(building: Building): RouteLocationRaw;
    roomList(term: string): RouteLocationRaw;
    buildingList(term: string): RouteLocationRaw;
};
