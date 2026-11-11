export type Column = {
    key: string;
    label?: string;
    width?: number;
    align?: "left" | "center" | "right";
    sortKey?: string;
};

export type ConditionalColumn = Column & { visible?: boolean };

export type SortDirection = "asc" | "desc";

export type SortState = {
    by: string;
    direction: SortDirection;
};
