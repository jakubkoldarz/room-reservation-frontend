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

export function toApiError(err: unknown): ApiError {
    if (isCancel(err)) return { kind: "canceled" };
    if (err instanceof ZodiosError) return { kind: "contract", message: err.message };
    if (!isAxiosError(err)) {
        return { kind: "unknown", message: err instanceof Error ? err.message : String(err) };
    }
    if (!err.response) return { kind: "network" };

    const { status, data } = err.response;
    const parsed = ProblemDetailsSchema.safeParse(data);
    const problem = parsed.success ? parsed.data : null;

    if (status === 400 && problem?.errors) {
        const fieldErrors: Record<string, string[]> = {};
        const formErrors: string[] = [];
        for (const [key, messages] of Object.entries(problem.errors)) {
            if (isFormLevelKey(key)) formErrors.push(...messages);
            else fieldErrors[toFieldPath(key)] = messages;
        }
        return { kind: "validation", fieldErrors, formErrors };
    }

    return {
        kind: "http",
        status,
        title: problem?.title ?? null,
        detail: problem?.detail ?? null,
        conflictingItems: problem?.conflictingItems ?? [],
    };
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
            return error.detail ?? error.title ?? `Request failed with status ${error.status}.`;
        case "contract":
            return "The server returned an unexpected response.";
        case "unknown":
            return "Something went wrong.";
        default:
            return assertNever(error);
    }
}
