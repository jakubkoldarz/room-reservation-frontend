import { apiErrorMessage, type ApiError } from "@/api/errors";

const TOO_MANY_REQUESTS = 429;

function isHttpStatus(error: ApiError, status: number): boolean {
    return error.kind === "http" && error.status === status;
}

function tooManyRequestsMessage(error: ApiError): string | null {
    return isHttpStatus(error, TOO_MANY_REQUESTS)
        ? "Too many attempts. Wait a moment and try again."
        : null;
}

export function credentialsErrorMessage(error: ApiError): string {
    if (isHttpStatus(error, 401)) return "Incorrect email or password.";
    return tooManyRequestsMessage(error) ?? apiErrorMessage(error);
}

export function verificationCodeErrorMessage(error: ApiError): string {
    if (isHttpStatus(error, 400)) return "This code is invalid or has expired.";
    return tooManyRequestsMessage(error) ?? apiErrorMessage(error);
}

export function authErrorMessage(error: ApiError): string {
    return tooManyRequestsMessage(error) ?? apiErrorMessage(error);
}

export function isEmailTaken(error: ApiError): boolean {
    return isHttpStatus(error, 400);
}
