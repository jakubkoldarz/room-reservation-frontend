import { computed } from "vue";
import { useRoute } from "vue-router";
import type { Pager } from "../types";

function toPositiveInt(value: unknown, fallback: number) {
    const n = Number(value);
    return Number.isInteger(n) && n > 0 ? n : fallback;
}

export function usePager(defaultPageSize: number) {
    const route = useRoute();
    const page = computed(() => route.query.page ?? 1);
    const pager = computed<Pager>(() => ({ page: toPositiveInt(page.value, 1), pageSize: defaultPageSize }));

    return { page, pager };
}
