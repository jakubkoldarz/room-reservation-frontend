import type { ApiError } from "@/api/errors";
import { isConflict } from "@/features/rooms/utils/conflicts";

const DEFAULT_ROLE_EXISTS_TEXT = "default role already exists";
const NAME_TAKEN_TEXT = "name already exists";

function conflictDetailIncludes(error: ApiError, text: string): boolean {
    if (error.kind !== "http") return false;
    if (!isConflict(error)) return false;
    if (error.detail === null) return false;
    return error.detail.toLowerCase().includes(text);
}

export function isDefaultRoleConflict(error: ApiError): boolean {
    return conflictDetailIncludes(error, DEFAULT_ROLE_EXISTS_TEXT);
}

export function isRoleNameTaken(error: ApiError): boolean {
    return conflictDetailIncludes(error, NAME_TAKEN_TEXT);
}
