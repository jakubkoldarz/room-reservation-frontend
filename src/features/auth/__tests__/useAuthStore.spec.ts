import { beforeEach, describe, expect, it, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useAuthStore } from "../stores/useAuthStore";

const postAuthrefresh = vi.fn();
vi.mock("@/api/client", () => ({
    default: { postAuthrefresh: (...args: unknown[]) => postAuthrefresh(...args) },
}));

describe("useAuthStore.tryRefreshToken", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        postAuthrefresh.mockReset();
    });

    it("równoległe wywołania wysyłają tylko jedno żądanie odświeżenia", async () => {
        postAuthrefresh.mockResolvedValue({ jwtToken: "new-token" });
        const store = useAuthStore();

        const results = await Promise.all([
            store.tryRefreshToken(),
            store.tryRefreshToken(),
            store.tryRefreshToken(),
        ]);

        expect(results).toEqual([true, true, true]);
        expect(postAuthrefresh).toHaveBeenCalledTimes(1);
        expect(store.jwtToken).toBe("new-token");
    });

    it("kolejne odświeżenie po zakończeniu poprzedniego wysyła nowe żądanie", async () => {
        postAuthrefresh.mockResolvedValue({ jwtToken: "first" });
        const store = useAuthStore();

        await store.tryRefreshToken();
        postAuthrefresh.mockResolvedValue({ jwtToken: "second" });
        await store.tryRefreshToken();

        expect(postAuthrefresh).toHaveBeenCalledTimes(2);
        expect(store.jwtToken).toBe("second");
    });

    it("nieudane odświeżenie zwraca false i nie zmienia tokenu", async () => {
        postAuthrefresh.mockRejectedValue(new Error("401"));
        const store = useAuthStore();
        store.jwtToken = "old-token";

        const results = await Promise.all([store.tryRefreshToken(), store.tryRefreshToken()]);

        expect(results).toEqual([false, false]);
        expect(postAuthrefresh).toHaveBeenCalledTimes(1);
        expect(store.jwtToken).toBe("old-token");
    });
});
