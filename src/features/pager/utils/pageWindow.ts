import type { PageItem } from "../types";

function toPageNumber(value: number): number {
    if (!Number.isFinite(value)) return 1;
    return Math.max(1, Math.floor(value));
}

function pageItem(page: number, activePage: number): PageItem {
    return { kind: "page", page, active: page === activePage };
}

function visiblePages(active: number, last: number, siblings: number): number[] {
    const pages = [1];
    for (let page = active - siblings; page <= active + siblings; page++) {
        const isInRange = page > 1 && page < last;
        if (isInRange) pages.push(page);
    }
    if (last > 1) pages.push(last);
    return pages;
}

export function pageWindow(current: number, total: number, siblings = 1): PageItem[] {
    const last = toPageNumber(total);
    const active = Math.min(toPageNumber(current), last);

    const items: PageItem[] = [];
    let previous: number | null = null;
    let hasGap = false;

    for (const page of visiblePages(active, last, siblings)) {
        let missing = 0;
        if (previous !== null) missing = page - previous - 1;

        if (missing === 1) {
            items.push(pageItem(page - 1, active));
        } else if (missing > 1) {
            if (hasGap) {
                items.push({ kind: "gap", key: "gap-end" });
            } else {
                items.push({ kind: "gap", key: "gap-start" });
            }
            hasGap = true;
        }

        items.push(pageItem(page, active));
        previous = page;
    }

    return items;
}
