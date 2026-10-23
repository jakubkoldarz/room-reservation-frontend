export type PageItem =
    { kind: "page"; page: number; active: boolean } | { kind: "gap"; key: "gap-start" | "gap-end" };

function toPageNumber(value: number): number {
    return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1;
}

/**
 * Numery stron do pokazania w pagerze: pierwsza, ostatnia i `siblings` sąsiadów bieżącej.
 * Dziura na jedną stronę jest wypełniana tą stroną, większa — przerwą („…”).
 *
 * pageWindow(5, 10) → 1 … 4 [5] 6 … 10
 */
export function pageWindow(current: number, total: number, siblings = 1): PageItem[] {
    const last = toPageNumber(total);
    const active = Math.min(toPageNumber(current), last);

    const visible = new Set([1, last]);
    for (let page = active - siblings; page <= active + siblings; page++) {
        if (page >= 1 && page <= last) visible.add(page);
    }

    const items: PageItem[] = [];
    const toItem = (page: number): PageItem => ({ kind: "page", page, active: page === active });
    let previous: number | null = null;

    for (const page of [...visible].sort((a, b) => a - b)) {
        if (previous !== null) {
            const missing = page - previous - 1;
            if (missing === 1) {
                items.push(toItem(previous + 1));
            } else if (missing > 1) {
                const hasGap = items.some((item) => item.kind === "gap");
                items.push({ kind: "gap", key: hasGap ? "gap-end" : "gap-start" });
            }
        }
        items.push(toItem(page));
        previous = page;
    }

    return items;
}
