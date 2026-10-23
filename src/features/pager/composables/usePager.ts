import { computed } from "vue";
import { useRoute } from "vue-router";
import type { Pager } from "../types";

function toPositiveInt(value: unknown, fallback: number) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function usePager(defaultPageSize = 25) {
    const route = useRoute();
    const pager = computed<Pager>(() => ({
        page: toPositiveInt(route.query?.page, 1),
        pageSize: defaultPageSize,
    }));

    return pager;
}
