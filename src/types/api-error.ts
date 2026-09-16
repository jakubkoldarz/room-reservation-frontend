export interface ValidationProblemDetails {
    status: number;
    errors: Record<string, string[]>;
}

export interface ApiErrorResponse {
    message: string;
    statusCode: number;
    conflictingItems?: unknown;
}

export function isValidationProblem(data: unknown): data is ValidationProblemDetails {
    return typeof data === "object" && data !== null && "errors" in data;
}
