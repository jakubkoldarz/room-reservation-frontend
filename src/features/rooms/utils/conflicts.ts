import { HttpStatusCode } from "axios";
import type { ApiError } from "@/api/errors";

export function isConflict(error: ApiError): boolean {
    return error.kind === "http" && error.status === HttpStatusCode.Conflict;
}
