import type { Component } from "vue";
import * as SolidIcons from "@heroicons/vue/24/solid";
import type { EquipmentIconName } from "./types";

export const EQUIPMENT_ICONS = SolidIcons;

export function isEquipmentIconName(name: string): name is EquipmentIconName {
    return Object.prototype.hasOwnProperty.call(EQUIPMENT_ICONS, name);
}

export function iconFor(name: string): Component {
    return isEquipmentIconName(name) ? EQUIPMENT_ICONS[name] : SolidIcons.QuestionMarkCircleIcon;
}

export function iconLabel(name: string): string {
    return name.replace(/Icon$/, "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function searchIcons(query: string): EquipmentIconName[] {
    const needle = normalize(query);
    const names = Object.keys(EQUIPMENT_ICONS).filter(isEquipmentIconName);
    return names.filter((name) => normalize(iconLabel(name)).includes(needle));
}
