import type { Building } from "../types";

export function formatAddress(info: Building): string {
    const { street, postalCode, city } = info;
    const cityLine = [postalCode, city].filter(Boolean).join(" ");

    return [street, cityLine].filter(Boolean).join(", ");
}
