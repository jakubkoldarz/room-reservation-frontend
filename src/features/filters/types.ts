import type { Component } from "vue";
import type { SelectOption } from "@/features/shared/types";

export type FilterBase<K extends string = string> = {
    key: K;
    placeholder: string;
    icon?: Component;
};

export type Filter<K extends string = string> = FilterBase<K> &
    (
        | {
              type: "select" | "multiselect";
              values: readonly SelectOption[];
          }
        | {
              type: "text" | "number" | "time";
          }
    );

export type FilterValues<K extends string> = Partial<Record<K, string>>;

export function defineFilters<const T extends readonly Filter[]>(filters: T): T {
    return filters;
}
