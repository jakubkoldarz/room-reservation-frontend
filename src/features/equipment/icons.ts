import type { Component } from "vue";
import * as SolidIcons from "@heroicons/vue/24/solid";

/** Wszystkie ikony Heroicons „solid” (24 px). Klucz to nazwa zapisywana w API, np. "TvIcon". */
export const EQUIPMENT_ICONS = SolidIcons;

export type EquipmentIconName = keyof typeof EQUIPMENT_ICONS;

export function isEquipmentIconName(name: string): name is EquipmentIconName {
    // Nie `name in ...` — to przepuściłoby np. "toString" z prototypu.
    return Object.prototype.hasOwnProperty.call(EQUIPMENT_ICONS, name);
}

/** Komponent ikony dla nazwy z API; nieznana nazwa → znak zapytania. */
export function iconFor(name: string): Component {
    return isEquipmentIconName(name) ? EQUIPMENT_ICONS[name] : SolidIcons.QuestionMarkCircleIcon;
}

/** "ComputerDesktopIcon" → "Computer Desktop" */
export function iconLabel(name: string): string {
    return name.replace(/Icon$/, "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

/** Do wyszukiwania: "computer-desktop", "Computer Desktop" i "computerdesktop" znaczą to samo. */
function normalize(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/** Nazwy ikon pasujące do wyszukiwanej frazy (pusta fraza → wszystkie). */
export function searchIcons(query: string): EquipmentIconName[] {
    const needle = normalize(query);
    const names = Object.keys(EQUIPMENT_ICONS).filter(isEquipmentIconName);
    return names.filter((name) => normalize(iconLabel(name)).includes(needle));
}
