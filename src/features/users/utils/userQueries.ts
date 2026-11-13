import { z } from "zod";
import type { UserListQuery } from "../types";

function textOrUndefined(value: string): string | undefined {
    const trimmed = value.trim();
    if (trimmed === "") return undefined;
    return trimmed;
}

function uuidOrUndefined(value: string): string | undefined {
    const parsed = z.string().uuid().safeParse(value);
    if (!parsed.success) return undefined;
    return parsed.data;
}

export function toUserQueries(query: UserListQuery, pageSize: number) {
    return {
        Lastname: textOrUndefined(query.lastname),
        Firstname: textOrUndefined(query.firstname),
        Email: textOrUndefined(query.email),
        RoleId: uuidOrUndefined(query.role),
        Page: query.page,
        PageSize: pageSize,
    };
}
