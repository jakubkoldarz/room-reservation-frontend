import { describe, expect, it } from "vitest";
import { LoginFormSchema, ProfileFormSchema, RegisterFormSchema } from "../schemas";

function issuesOf(result: {
    success: boolean;
    error?: { issues: { path: unknown[]; message: string }[] };
}) {
    return result.error?.issues.map((issue) => [issue.path.join("."), issue.message]);
}

describe("LoginFormSchema", () => {
    it("wymaga poprawnego maila i niepustego hasła, bez minimalnej długości", () => {
        expect(LoginFormSchema.safeParse({ email: " a@b.pl ", password: "x" })).toMatchObject({
            success: true,
            data: { email: "a@b.pl", password: "x" },
        });
        expect(issuesOf(LoginFormSchema.safeParse({ email: "abc", password: "" }))).toEqual([
            ["email", "Enter a valid email address"],
            ["password", "Password is required"],
        ]);
    });
});

describe("RegisterFormSchema", () => {
    it("hasło min. 8 znaków (jak w backendzie)", () => {
        const result = RegisterFormSchema.safeParse({
            email: "a@b.pl",
            password: "1234567",
            confirmPassword: "1234567",
        });
        expect(issuesOf(result)).toEqual([
            ["password", "Password must have at least 8 characters"],
        ]);
    });

    it("powtórzone hasło musi być takie samo", () => {
        const result = RegisterFormSchema.safeParse({
            email: "a@b.pl",
            password: "12345678",
            confirmPassword: "12345679",
        });
        expect(issuesOf(result)).toEqual([["confirmPassword", "Passwords do not match"]]);
    });
});

describe("ProfileFormSchema", () => {
    it("imię 3–50 znaków po przycięciu, nazwisko wymagane", () => {
        expect(
            issuesOf(ProfileFormSchema.safeParse({ firstname: " Al ", lastname: "  " })),
        ).toEqual([
            ["firstname", "First name must have at least 3 characters"],
            ["lastname", "Last name is required"],
        ]);
        expect(
            ProfileFormSchema.safeParse({ firstname: " Jan ", lastname: " Kowalski " }),
        ).toMatchObject({
            success: true,
            data: { firstname: "Jan", lastname: "Kowalski" },
        });
    });
});
