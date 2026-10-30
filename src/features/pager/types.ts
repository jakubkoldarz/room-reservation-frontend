export type PageItem =
    { kind: "page"; page: number; active: boolean } | { kind: "gap"; key: "gap-start" | "gap-end" };
