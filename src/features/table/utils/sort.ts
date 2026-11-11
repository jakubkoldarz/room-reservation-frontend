import type { Column, SortState } from "../types";

export function sortKeys(columns: readonly Column[]): string[] {
    return columns.flatMap((column) => (column.sortKey ? [column.sortKey] : []));
}

export function parseSort(value: string, allowed: readonly string[]): SortState | null {
    const descending = value.startsWith("-");
    const by = descending ? value.slice(1) : value;
    if (!allowed.includes(by)) return null;
    return { by, direction: descending ? "desc" : "asc" };
}

export function formatSort(sort: SortState): string {
    return sort.direction === "desc" ? `-${sort.by}` : sort.by;
}

export function isSameSort(a: SortState, b: SortState): boolean {
    return a.by === b.by && a.direction === b.direction;
}

export function nextSort(current: SortState, by: string): SortState {
    if (current.by !== by) return { by, direction: "asc" };
    return { by, direction: current.direction === "asc" ? "desc" : "asc" };
}

export function toSortQueries(sort: SortState) {
    return { SortBy: sort.by, SortDirection: sort.direction };
}
