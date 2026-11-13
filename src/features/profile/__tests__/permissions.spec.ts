import { describe, expect, it } from "vitest";
import { groupPermissions } from "../utils/permissions";

describe("groupPermissions", () => {
    it("grupuje po obszarze i układa obszary oraz akcje w ustalonej kolejności", () => {
        expect(
            groupPermissions([
                "room.edit",
                "building.list",
                "room.view",
                "reservation.force.cancel",
                "reservation.create",
                "room.list",
            ]),
        ).toEqual([
            { area: "Reservations", actions: ["Book", "Cancel any"] },
            { area: "Rooms", actions: ["View", "List", "Edit"] },
            { area: "Buildings", actions: ["List"] },
        ]);
    });

    it("usuwa powtórzenia i pomija wpisy bez obszaru albo akcji", () => {
        expect(groupPermissions(["room.view", "room.view", "room", ".view", ""])).toEqual([
            { area: "Rooms", actions: ["View"] },
        ]);
    });

    it("nieznane obszary i akcje trafiają na koniec z nazwą od wielkiej litery", () => {
        expect(
            groupPermissions(["zebra.fly.high", "audit.export", "room.archive", "room.view"]),
        ).toEqual([
            { area: "Rooms", actions: ["View", "Archive"] },
            { area: "Audit", actions: ["Export"] },
            { area: "Zebra", actions: ["Fly high"] },
        ]);
    });
});
