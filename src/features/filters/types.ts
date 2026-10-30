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
              type: "select";
              values: readonly SelectOption[];
          }
        | {
              type: "text";
          }
    );

export type FilterValues<K extends string> = Partial<Record<K, string>>;

export function defineFilters<const T extends readonly Filter[]>(filters: T): T {
    return filters;
}
