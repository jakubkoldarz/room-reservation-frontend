import { toApiError, type ApiError } from "./errors";

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

export async function apiCall<T>(fn: () => Promise<T>): Promise<ApiResult<T>> {
    try {
        return { ok: true, data: await fn() };
    } catch (err) {
        return { ok: false, error: toApiError(err) };
    }
}
