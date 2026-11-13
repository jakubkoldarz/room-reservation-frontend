import { ZodiosError } from "@zodios/core";
import { isAxiosError, isCancel } from "axios";
import { z } from "zod";
import { assertNever } from "@/utils/assertNever";

export type ApiError =
    | { kind: "canceled" }
    | { kind: "network" }
    | {
          kind: "validation";
          fieldErrors: Readonly<Record<string, readonly string[]>>;
          formErrors: readonly string[];
      }
    | {
          kind: "http";
          status: number;
          title: string | null;
          detail: string | null;
          conflictingItems: readonly unknown[];
      }
    | { kind: "contract"; message: string }
    | { kind: "unknown"; message: string };

const ProblemDetailsSchema = z.object({
    title: z.string().nullish(),
    detail: z.string().nullish(),
    errors: z.record(z.array(z.string())).nullish(),
    conflictingItems: z.array(z.unknown()).nullish(),
});

function isFormLevelKey(key: string): boolean {
    return key === "$" || key.startsWith("$.") || key === "request";
}

function lowerFirst(segment: string): string {
    return segment.charAt(0).toLowerCase() + segment.slice(1);
}

function toFieldPath(key: string): string {
    return key.split(".").map(lowerFirst).join(".");
}

function unknownError(err: unknown): ApiError {
    if (err instanceof Error) return { kind: "unknown", message: err.message };
    return { kind: "unknown", message: String(err) };
}

function validationError(errors: Record<string, string[]>): ApiError {
    const fieldErrors: Record<string, string[]> = {};
    const formErrors: string[] = [];

    for (const [key, messages] of Object.entries(errors)) {
        if (isFormLevelKey(key)) {
            formErrors.push(...messages);
        } else {
            fieldErrors[toFieldPath(key)] = messages;
        }
    }

    return { kind: "validation", fieldErrors, formErrors };
}

function httpError(status: number, data: unknown): ApiError {
    const parsed = ProblemDetailsSchema.safeParse(data);
    if (!parsed.success) {
        return { kind: "http", status, title: null, detail: null, conflictingItems: [] };
    }

    const problem = parsed.data;
    if (status === 400 && problem.errors) {
        return validationError(problem.errors);
    }

    return {
        kind: "http",
        status,
        title: problem.title ?? null,
        detail: problem.detail ?? null,
        conflictingItems: problem.conflictingItems ?? [],
    };
}

export function toApiError(err: unknown): ApiError {
    if (isCancel(err)) return { kind: "canceled" };
    if (err instanceof ZodiosError) return { kind: "contract", message: err.message };
    if (!isAxiosError(err)) return unknownError(err);
    if (!err.response) return { kind: "network" };

    return httpError(err.response.status, err.response.data);
}

export function apiErrorMessage(error: ApiError): string {
    switch (error.kind) {
        case "canceled":
            return "The request was canceled.";
        case "network":
            return "Cannot reach the server. Check your connection and try again.";
        case "validation":
            return "Some fields are invalid.";
        case "http":
            if (error.detail !== null) return error.detail;
            if (error.title !== null) return error.title;
            return `Request failed with status ${error.status}.`;
        case "contract":
            return "The server returned an unexpected response.";
        case "unknown":
            return "Something went wrong.";
        default:
            return assertNever(error);
    }
}
