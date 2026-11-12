import type { Column, SortState } from "../types";

export function sortKeys(columns: readonly Column[]): string[] {
    const keys: string[] = [];
    for (const column of columns) {
        if (column.sortKey) keys.push(column.sortKey);
    }
    return keys;
}

export function parseSort(value: string, allowed: readonly string[]): SortState | null {
    const descending = value.startsWith("-");
    let by = value;
    if (descending) by = value.slice(1);

    if (!allowed.includes(by)) return null;
    if (descending) return { by, direction: "desc" };
    return { by, direction: "asc" };
}

export function formatSort(sort: SortState): string {
    if (sort.direction === "desc") return `-${sort.by}`;
    return sort.by;
}

export function isSameSort(a: SortState, b: SortState): boolean {
    return a.by === b.by && a.direction === b.direction;
}

export function nextSort(current: SortState, by: string): SortState {
    const isSameColumn = current.by === by;
    if (isSameColumn && current.direction === "asc") return { by, direction: "desc" };
    return { by, direction: "asc" };
}

export function toSortQueries(sort: SortState) {
    return { SortBy: sort.by, SortDirection: sort.direction };
}
