import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises } from "@vue/test-utils";
import { AxiosError } from "axios";
import type { Page } from "@/api/types";
import type { Building } from "../types";
import { useBuildingsStore } from "../stores/useBuildingsStore";

const getBuildings = vi.fn();
vi.mock("@/api/client", () => ({
    default: { getBuildings: (...args: unknown[]) => getBuildings(...args) },
}));

function building(name: string): Building {
    return {
        id: crypto.randomUUID(),
        name,
        street: "Main 1",
        city: "Lodz",
        postalCode: "90-001",
        floorsCount: 3,
    };
}

function page(names: string[], totalCount = names.length): Page<Building> {
    return {
        items: names.map(building),
        totalCount,
        page: 1,
        pageSize: 4,
        totalPages: 1,
        hasNextPage: false,
    };
}

describe("useBuildingsStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        getBuildings.mockReset();
    });

    it("zapisuje pobrane budynki i totalCount w stanie", async () => {
        getBuildings.mockResolvedValue(page(["A", "B"], 12));
        const store = useBuildingsStore();

        await store.fetchBuildings();

        expect(store.buildings.map((b) => b.name)).toEqual(["A", "B"]);
        expect(store.totalCount).toBe(12);
        expect(store.isLoaded).toBe(true);
        expect(store.isLoading).toBe(false);
    });

    it("pusty filtr nie wysyła Name, a filtr jest przycinany", async () => {
        getBuildings.mockResolvedValue(page([]));
        const store = useBuildingsStore();

        await store.fetchBuildings();
        expect(getBuildings).toHaveBeenLastCalledWith(
            expect.objectContaining({ queries: { Name: undefined, PageSize: 4 } }),
        );

        store.queryParam = "  hall ";
        await store.fetchBuildings();
        expect(getBuildings).toHaveBeenLastCalledWith(
            expect.objectContaining({ queries: { Name: "hall", PageSize: 4 } }),
        );
    });

    it("ensureLoaded pobiera tylko raz", async () => {
        getBuildings.mockResolvedValue(page(["A"]));
        const store = useBuildingsStore();

        await Promise.all([store.ensureLoaded(), store.ensureLoaded()]);
        await store.ensureLoaded();

        expect(getBuildings).toHaveBeenCalledOnce();
    });

    it("spóźniona odpowiedź starego wyszukiwania nie nadpisuje nowszej", async () => {
        let resolveOld: (value: Page<Building>) => void = () => {};
        getBuildings
            .mockReturnValueOnce(new Promise((resolve) => (resolveOld = resolve)))
            .mockResolvedValueOnce(page(["New"]));
        const store = useBuildingsStore();

        const first = store.fetchBuildings();
        await store.fetchBuildings();
        resolveOld(page(["Old"]));
        await first;
        await flushPromises();

        expect(store.buildings.map((b) => b.name)).toEqual(["New"]);
    });

    it("błąd zostawia poprzednie budynki i ustawia error", async () => {
        getBuildings
            .mockResolvedValueOnce(page(["A"]))
            .mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
        const store = useBuildingsStore();

        await store.fetchBuildings();
        await store.fetchBuildings();

        expect(store.buildings.map((b) => b.name)).toEqual(["A"]);
        expect(store.error).toEqual({ kind: "network" });
        expect(store.isLoading).toBe(false);
    });
});
