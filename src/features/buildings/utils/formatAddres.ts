import type { BuildingInfo } from "@/types/dtos";

export function formatAddress(info?: BuildingInfo | null): string {
    if (!info) return "";

    const { street, postalCode, city } = info;
    const cityLine = [postalCode, city].filter(Boolean).join(" ");

    return [street, cityLine].filter(Boolean).join(", ");
}
