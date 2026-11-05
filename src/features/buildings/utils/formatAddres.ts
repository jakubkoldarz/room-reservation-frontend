import type { Building } from "../types";

export function formatCityLine(info: Pick<Building, "postalCode" | "city">): string {
    return [info.postalCode, info.city].filter(Boolean).join(" ");
}

export function formatAddress(info: Building): string {
    return [info.street, formatCityLine(info)].filter(Boolean).join(", ");
}
