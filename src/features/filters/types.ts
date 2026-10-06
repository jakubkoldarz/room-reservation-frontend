export type FilterBase = {
    key: string;
    placeholder: string;
};

export type Filter = FilterBase &
    (
        | {
              type: "select";
              values: FilterSelectValues[];
          }
        | {
              type: "text";
          }
    );

export type FilterSelectValues = {
    value: string;
    label: string;
};

export type FilterValues<T extends readonly Filter[]> = Partial<Record<T[number]["key"], string>>;

export function defineFilters<const T extends readonly Filter[]>(filters: T) {
    return filters;
}
