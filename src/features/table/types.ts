export type Column = {
    key: string;
    label?: string;
    width?: number;
    align?: "left" | "center" | "right";
};

export type ConditionalColumn = Column & { visible?: boolean };

export type Pager = {
    page: number;
    pageSize: number;
    totalCount: number;
};
