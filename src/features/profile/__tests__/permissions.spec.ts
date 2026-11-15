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
            {
                area: "Reservations",
                actions: [
                    { label: "Book", kind: "write" },
                    { label: "Cancel any", kind: "danger" },
                ],
            },
            {
                area: "Rooms",
                actions: [
                    { label: "View", kind: "read" },
                    { label: "List", kind: "read" },
                    { label: "Edit", kind: "write" },
                ],
            },
            { area: "Buildings", actions: [{ label: "List", kind: "read" }] },
        ]);
    });

    it("usuwa powtórzenia i pomija wpisy bez obszaru albo akcji", () => {
        expect(groupPermissions(["room.view", "room.view", "room", ".view", ""])).toEqual([
            { area: "Rooms", actions: [{ label: "View", kind: "read" }] },
        ]);
    });

    it("nieznane obszary i akcje trafiają na koniec z nazwą od wielkiej litery", () => {
        expect(
            groupPermissions(["zebra.fly.high", "audit.export", "room.archive", "room.view"]),
        ).toEqual([
            {
                area: "Rooms",
                actions: [
                    { label: "View", kind: "read" },
                    { label: "Archive", kind: "write" },
                ],
            },
            { area: "Audit", actions: [{ label: "Export", kind: "write" }] },
            { area: "Zebra", actions: [{ label: "Fly high", kind: "write" }] },
        ]);
    });
});
