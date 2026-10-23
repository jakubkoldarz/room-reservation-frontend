export type FilterBase<K extends string = string> = {
    key: K;
    placeholder: string;
};

export type Filter<K extends string = string> = FilterBase<K> &
    (
        | {
              type: "select";
              values: readonly FilterSelectValues[];
          }
        | {
              type: "text";
          }
    );

export type FilterSelectValues = {
    value: string;
    label: string;
};

export type FilterValues<K extends string> = Partial<Record<K, string>>;

export function defineFilters<const T extends readonly Filter[]>(filters: T): T {
    return filters;
}
