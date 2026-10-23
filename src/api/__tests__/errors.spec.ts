import { describe, expect, it } from "vitest";
import { AxiosError, AxiosHeaders, CanceledError, type InternalAxiosRequestConfig } from "axios";
import { ZodiosError } from "@zodios/core";
import { apiCall } from "../apiCall";
import { apiErrorMessage, toApiError } from "../errors";

const config: InternalAxiosRequestConfig = { headers: new AxiosHeaders() };

function httpError(status: number, data: unknown): AxiosError {
    return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, undefined, {
        status,
        statusText: "",
        data,
        headers: {},
        config,
    });
}

// Odpowiedzi skopiowane z prawdziwego backendu (localhost:5000).
describe("toApiError", () => {
    it("400 z błędami pól → validation z kluczami w camelCase", () => {
        const error = toApiError(
            httpError(400, {
                title: "One or more validation errors occurred.",
                status: 400,
                errors: {
                    Email: ["The Email field is not a valid e-mail address."],
                    "Availabilities[0].StartTime": ["Required."],
                },
            }),
        );
        expect(error).toEqual({
            kind: "validation",
            fieldErrors: {
                email: ["The Email field is not a valid e-mail address."],
                "availabilities[0].startTime": ["Required."],
            },
            formErrors: [],
        });
    });

    it("klucze $ i request trafiają do formErrors", () => {
        const error = toApiError(
            httpError(400, {
                status: 400,
                errors: {
                    $: ["'b' is an invalid start of a property name."],
                    request: ["Required."],
                },
            }),
        );
        expect(error).toEqual({
            kind: "validation",
            fieldErrors: {},
            formErrors: ["'b' is an invalid start of a property name.", "Required."],
        });
    });

    it("401 z detail → http z detail", () => {
        const error = toApiError(
            httpError(401, { title: "Unauthorized", status: 401, detail: "Invalid credentials" }),
        );
        expect(error).toEqual({
            kind: "http",
            status: 401,
            title: "Unauthorized",
            detail: "Invalid credentials",
        });
        expect(apiErrorMessage(error)).toBe("Invalid credentials");
    });

    it("body, które nie jest ProblemDetails → http bez tytułu", () => {
        const error = toApiError(httpError(500, "<html>Internal Server Error</html>"));
        expect(error).toEqual({ kind: "http", status: 500, title: null, detail: null });
        expect(apiErrorMessage(error)).toBe("Request failed with status 500.");
    });

    it("brak odpowiedzi → network", () => {
        expect(toApiError(new AxiosError("Network Error", "ERR_NETWORK", config))).toEqual({
            kind: "network",
        });
    });

    it("anulowanie → canceled", () => {
        expect(toApiError(new CanceledError())).toEqual({ kind: "canceled" });
    });

    it("niezgodna odpowiedź (Zodios) → contract", () => {
        const error = toApiError(new ZodiosError("Zodios: Invalid response"));
        expect(error.kind).toBe("contract");
    });

    it("cokolwiek innego → unknown", () => {
        expect(toApiError(new TypeError("boom"))).toEqual({ kind: "unknown", message: "boom" });
        expect(toApiError("boom")).toEqual({ kind: "unknown", message: "boom" });
    });
});

describe("apiCall", () => {
    it("sukces → ok: true", async () => {
        expect(await apiCall(async () => 42)).toEqual({ ok: true, data: 42 });
    });

    it("wyjątek → ok: false z ApiError, bez rzucania", async () => {
        const result = await apiCall(() => Promise.reject(httpError(404, { title: "Not Found" })));
        expect(result).toEqual({
            ok: false,
            error: { kind: "http", status: 404, title: "Not Found", detail: null },
        });
    });
});
