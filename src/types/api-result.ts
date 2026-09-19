import type { ApiErrorResponse } from "./api-error";

export type ApiResult<T> = { success: true; data: T } | { success: false; error: ApiErrorResponse | null };
