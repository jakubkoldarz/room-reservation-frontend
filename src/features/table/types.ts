export type Column = {
    key: string;
    /** Kolumna bez etykiety to kolumna akcji (link, usuń) — na wąskim ekranie trafia do paska przycisków. */
    label?: string;
    width?: number;
    align?: "left" | "center" | "right";
};

export type ConditionalColumn = Column & { visible?: boolean };
