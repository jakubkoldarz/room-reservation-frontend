import { describe, expect, it } from "vitest";
import type { ApiError } from "@/api/errors";
import {
    countSelected,
    groupPermissionOptions,
    permissionIdsByName,
    permissionSummary,
    withIds,
    withoutIds,
} from "../utils/permissionGroups";
import { isDefaultRoleConflict, isRoleNameTaken } from "../utils/roleErrors";

const PERMISSIONS = [
    { id: "p1", name: "room.edit" },
    { id: "p2", name: "building.list" },
    { id: "p3", name: "room.view" },
    { id: "p4", name: "reservation.force.cancel" },
    { id: "p5", name: "broken" },
];

function conflict(detail: string | null): ApiError {
    return { kind: "http", status: 409, title: "Conflict", detail, conflictingItems: [] };
}

describe("groupPermissionOptions", () => {
    it("grupuje uprawnienia po obszarze, zachowuje id i kolejność akcji", () => {
        expect(groupPermissionOptions(PERMISSIONS)).toEqual([
            { area: "Reservations", options: [{ id: "p4", label: "Cancel any" }] },
            {
                area: "Rooms",
                options: [
                    { id: "p3", label: "View" },
                    { id: "p1", label: "Edit" },
                ],
            },
            { area: "Buildings", options: [{ id: "p2", label: "List" }] },
        ]);
    });
});

describe("permissionIdsByName", () => {
    it("zamienia nazwy uprawnień roli na identyfikatory", () => {
        expect(permissionIdsByName(PERMISSIONS, ["room.view", "building.list", "missing"])).toEqual(
            ["p2", "p3"],
        );
    });
});

describe("zaznaczanie uprawnień", () => {
    it("liczy zaznaczone identyfikatory z grupy", () => {
        expect(countSelected(["a", "b", "c"], ["c", "x", "a"])).toBe(2);
    });

    it("dodaje identyfikatory bez powtórzeń", () => {
        expect(withIds(["a"], ["a", "b"])).toEqual(["a", "b"]);
    });

    it("usuwa wskazane identyfikatory", () => {
        expect(withoutIds(["a", "b", "c"], ["b", "x"])).toEqual(["a", "c"]);
    });
});

describe("permissionSummary", () => {
    it("opisuje liczbę uprawnień roli", () => {
        expect(permissionSummary({ isSuperAdmin: false, permissions: [] })).toBe("No permissions");
        expect(permissionSummary({ isSuperAdmin: false, permissions: ["room.view"] })).toBe(
            "1 permission",
        );
        expect(permissionSummary({ isSuperAdmin: false, permissions: ["a.b", "c.d"] })).toBe(
            "2 permissions",
        );
    });

    it("super admin ma zawsze wszystkie uprawnienia", () => {
        expect(permissionSummary({ isSuperAdmin: true, permissions: [] })).toBe("All permissions");
    });
});

describe("konflikty zapisu roli", () => {
    it("rozpoznaje konflikt roli domyślnej po komunikacie backendu", () => {
        const error = conflict("A default role already exists.");
        expect(isDefaultRoleConflict(error)).toBe(true);
        expect(isRoleNameTaken(error)).toBe(false);
    });

    it("rozpoznaje zajętą nazwę po komunikacie backendu", () => {
        const error = conflict("A role with this name already exists.");
        expect(isDefaultRoleConflict(error)).toBe(false);
        expect(isRoleNameTaken(error)).toBe(true);
    });

    it("blokada zdjęcia roli domyślnej nie jest żadnym z tych konfliktów", () => {
        const error = conflict(
            "This role is the default one. Set another role as default instead.",
        );
        expect(isDefaultRoleConflict(error)).toBe(false);
        expect(isRoleNameTaken(error)).toBe(false);
    });

    it("inne błędy nie są konfliktem", () => {
        const error: ApiError = { kind: "network" };
        expect(isDefaultRoleConflict(error)).toBe(false);
        expect(isRoleNameTaken(error)).toBe(false);
        expect(isDefaultRoleConflict(conflict(null))).toBe(false);
    });
});
