import { describe, expect, it } from "vitest";
import type { UserListQuery } from "../types";
import { toUserQueries } from "../utils/userQueries";

const ROLE_ID = "10000000-0000-0000-0000-000000000001";

function query(overrides: Partial<UserListQuery>): UserListQuery {
    return {
        page: 1,
        lastname: "",
        firstname: "",
        email: "",
        role: "",
        sort: "",
        ...overrides,
    };
}

describe("toUserQueries", () => {
    it("puste filtry nie trafiają do zapytania", () => {
        expect(toUserQueries(query({}), 25)).toEqual({
            Lastname: undefined,
            Firstname: undefined,
            Email: undefined,
            RoleId: undefined,
            Page: 1,
            PageSize: 25,
        });
    });

    it("przycina tekst i przekazuje poprawne id roli", () => {
        expect(
            toUserQueries(
                query({ lastname: " Nowak ", firstname: "Anna", email: " @uni ", role: ROLE_ID }),
                10,
            ),
        ).toMatchObject({ Lastname: "Nowak", Firstname: "Anna", Email: "@uni", RoleId: ROLE_ID });
    });

    it("pomija rolę, która nie jest identyfikatorem", () => {
        expect(toUserQueries(query({ role: "admin", page: 3 }), 25)).toMatchObject({
            RoleId: undefined,
            Page: 3,
        });
    });
});
