import { describe, expect, it, vi } from "vitest";
import { effectScope, nextTick, shallowRef } from "vue";
import { flushPromises } from "@vue/test-utils";
import { AxiosError } from "axios";
import type { Page } from "@/api/types";
import { usePagedList } from "../usePagedList";

interface Query {
    page: number;
    name: string;
}

function page(items: string[], pageNumber = 1): Page<string> {
    return {
        items,
        page: pageNumber,
        pageSize: 10,
        totalCount: items.length,
        totalPages: 1,
        hasNextPage: false,
    };
}

function deferred<T>() {
    let resolve: (value: T) => void = () => {};
    let reject: (reason: unknown) => void = () => {};
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

function setup(fetchPage: (q: Query, signal: AbortSignal) => Promise<Page<string>>) {
    const query = shallowRef<Query>({ page: 1, name: "" });
    const scope = effectScope();
    const list = scope.run(() => usePagedList(fetchPage, query));
    if (!list) throw new Error("composable did not run");
    return { query, list, scope };
}

describe("usePagedList", () => {
    it("pobiera od razu i wystawia dane", async () => {
        const fetchPage = vi.fn(async () => page(["a", "b"]));
        const { list } = setup(fetchPage);

        expect(list.isLoading.value).toBe(true);
        await flushPromises();

        expect(fetchPage).toHaveBeenCalledOnce();
        expect(list.data.value?.items).toEqual(["a", "b"]);
        expect(list.isLoading.value).toBe(false);
        expect(list.error.value).toBeNull();
    });

    it("spóźniona odpowiedź nie nadpisuje nowszej, a stare żądanie jest anulowane", async () => {
        const slow = deferred<Page<string>>();
        const fast = deferred<Page<string>>();
        const signals: AbortSignal[] = [];
        const responses = [slow.promise, fast.promise];
        const { query, list } = setup((_q, signal) => {
            signals.push(signal);
            return responses[signals.length - 1] ?? Promise.reject(new Error("unexpected call"));
        });

        query.value = { page: 2, name: "" };
        await nextTick();
        expect(signals[0]?.aborted).toBe(true);

        fast.resolve(page(["new"], 2));
        await flushPromises();
        slow.resolve(page(["old"], 1));
        await flushPromises();

        expect(list.data.value?.items).toEqual(["new"]);
        expect(list.isLoading.value).toBe(false);
    });

    it("isLoading zostaje true, dopóki trwa OSTATNIE żądanie", async () => {
        const first = deferred<Page<string>>();
        const second = deferred<Page<string>>();
        const responses = [first.promise, second.promise];
        let calls = 0;
        const { query, list } = setup(() => responses[calls++] ?? Promise.reject(new Error("x")));

        query.value = { page: 2, name: "" };
        await nextTick();
        first.resolve(page(["old"]));
        await flushPromises();
        expect(list.isLoading.value).toBe(true);

        second.resolve(page(["new"]));
        await flushPromises();
        expect(list.isLoading.value).toBe(false);
    });

    it("błąd zostawia poprzednie dane i ustawia error", async () => {
        let fail = false;
        const { list } = setup(async () => {
            if (fail) throw new AxiosError("Network Error", "ERR_NETWORK");
            return page(["a"]);
        });
        await flushPromises();

        fail = true;
        await list.reload();

        expect(list.data.value?.items).toEqual(["a"]);
        expect(list.error.value).toEqual({ kind: "network" });
        expect(list.isLoading.value).toBe(false);
    });

    it("nie pobiera ponownie, gdy zapytanie ma tę samą treść (nowy obiekt z URL)", async () => {
        const fetchPage = vi.fn(async () => page([]));
        const { query } = setup(fetchPage);
        await flushPromises();

        query.value = { page: 1, name: "" };
        await flushPromises();
        expect(fetchPage).toHaveBeenCalledOnce();

        query.value = { page: 1, name: "x" };
        await flushPromises();
        expect(fetchPage).toHaveBeenCalledTimes(2);
    });

    it("reload pobiera z bieżącym zapytaniem", async () => {
        const fetchPage = vi.fn(async (q: Query) => page([q.name]));
        const { query, list } = setup(fetchPage);
        query.value = { page: 1, name: "hall" };
        await flushPromises();

        await list.reload();
        expect(fetchPage).toHaveBeenLastCalledWith(
            { page: 1, name: "hall" },
            expect.any(AbortSignal),
        );
    });

    it("zamknięcie scope anuluje żądanie w toku i nie ustawia błędu", async () => {
        const pending = deferred<Page<string>>();
        let signal: AbortSignal | undefined;
        const { list, scope } = setup((_q, s) => {
            signal = s;
            return pending.promise;
        });

        scope.stop();
        expect(signal?.aborted).toBe(true);
        pending.reject(new Error("aborted"));
        await flushPromises();
        expect(list.error.value).toBeNull();
    });
});
