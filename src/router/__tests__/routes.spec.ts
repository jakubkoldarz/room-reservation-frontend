import { describe, expect, it } from "vitest";
import router from "@/router";

const BUILDING_ID = "3f2504e0-4f89-11d3-9a0c-0305e82c3301";

describe("router paths", () => {
    it("resolves an unknown address to the not found page", () => {
        expect(router.resolve("/no-such-page").name).toBe("errors.notFound");
        expect(router.resolve("/buildings/1/2/3").name).toBe("errors.notFound");
    });

    it("resolves an id that is not a uuid to the not found page", () => {
        expect(router.resolve("/buildings/abc").name).toBe("errors.notFound");
        expect(router.resolve("/rooms/123/edit").name).toBe("errors.notFound");
        expect(router.resolve("/events/abc/edit").name).toBe("errors.notFound");
    });

    it("keeps the static and uuid paths working", () => {
        expect(router.resolve("/buildings/new").name).toBe("buildings.add");
        expect(router.resolve(`/buildings/${BUILDING_ID}`).name).toBe("buildings.view");
        expect(router.resolve(`/buildings/${BUILDING_ID}/edit`).name).toBe("buildings.edit");
    });

    it("builds a link from a route name and a uuid", () => {
        const link = router.resolve({ name: "rooms.view", params: { roomId: BUILDING_ID } });
        expect(link.path).toBe(`/rooms/${BUILDING_ID}`);
    });
});
