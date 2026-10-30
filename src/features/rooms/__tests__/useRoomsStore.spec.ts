import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { flushPromises } from "@vue/test-utils";
import { AxiosError } from "axios";
import type { Page } from "@/api/types";
import type { BasicRoom } from "../types";
import { useRoomsStore } from "../stores/useRoomsStore";

const getRooms = vi.fn();
vi.mock("@/api/client", () => ({
    default: { getRooms: (...args: unknown[]) => getRooms(...args) },
}));

function room(identifier: string): BasicRoom {
    return {
        id: crypto.randomUUID(),
        identifier,
        requiresApproval: false,
        capacity: 20,
        floor: 1,
    };
}

function page(identifiers: string[], totalCount = identifiers.length): Page<BasicRoom> {
    return {
        items: identifiers.map(room),
        totalCount,
        page: 1,
        pageSize: 4,
        totalPages: 1,
        hasNextPage: false,
    };
}

describe("useRoomsStore", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        getRooms.mockReset();
    });

    it("zapisuje pobrane pokoje i totalCount w stanie", async () => {
        getRooms.mockResolvedValue(page(["A1", "B2"], 12));
        const store = useRoomsStore();

        await store.fetchRooms();

        expect(store.rooms.map((r) => r.identifier)).toEqual(["A1", "B2"]);
        expect(store.totalCount).toBe(12);
        expect(store.isLoaded).toBe(true);
        expect(store.isLoading).toBe(false);
    });

    it("pusty filtr nie wysyła Identifier, a filtr jest przycinany", async () => {
        getRooms.mockResolvedValue(page([]));
        const store = useRoomsStore();

        await store.fetchRooms();
        expect(getRooms).toHaveBeenLastCalledWith(
            expect.objectContaining({ queries: { Identifier: undefined, PageSize: 4 } }),
        );

        store.queryParam = "  a1 ";
        await store.fetchRooms();
        expect(getRooms).toHaveBeenLastCalledWith(
            expect.objectContaining({ queries: { Identifier: "a1", PageSize: 4 } }),
        );
    });

    it("ensureLoaded pobiera tylko raz", async () => {
        getRooms.mockResolvedValue(page(["A1"]));
        const store = useRoomsStore();

        await Promise.all([store.ensureLoaded(), store.ensureLoaded()]);
        await store.ensureLoaded();

        expect(getRooms).toHaveBeenCalledOnce();
    });

    it("spóźniona odpowiedź starego wyszukiwania nie nadpisuje nowszej", async () => {
        let resolveOld: (value: Page<BasicRoom>) => void = () => {};
        getRooms
            .mockReturnValueOnce(new Promise((resolve) => (resolveOld = resolve)))
            .mockResolvedValueOnce(page(["New"]));
        const store = useRoomsStore();

        const first = store.fetchRooms();
        await store.fetchRooms();
        resolveOld(page(["Old"]));
        await first;
        await flushPromises();

        expect(store.rooms.map((r) => r.identifier)).toEqual(["New"]);
    });

    it("błąd zostawia poprzednie pokoje i ustawia error", async () => {
        getRooms
            .mockResolvedValueOnce(page(["A1"]))
            .mockRejectedValueOnce(new AxiosError("Network Error", "ERR_NETWORK"));
        const store = useRoomsStore();

        await store.fetchRooms();
        await store.fetchRooms();

        expect(store.rooms.map((r) => r.identifier)).toEqual(["A1"]);
        expect(store.error).toEqual({ kind: "network" });
        expect(store.isLoading).toBe(false);
    });
});
