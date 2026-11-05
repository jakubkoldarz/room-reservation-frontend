import { z } from "zod";

export const VERIFICATION_CODE_LENGTH = 6;
export const MIN_PASSWORD_LENGTH = 8;

const emailField = z
    .string({ required_error: "Email is required" })
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address");

export const LoginFormSchema = z.object({
    email: emailField,
    password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

export const RegisterFormSchema = z
    .object({
        email: emailField,
        password: z
            .string({ required_error: "Password is required" })
            .min(
                MIN_PASSWORD_LENGTH,
                `Password must have at least ${MIN_PASSWORD_LENGTH} characters`,
            ),
        confirmPassword: z
            .string({ required_error: "Repeat your password" })
            .min(1, "Repeat your password"),
    })
    .refine((values) => values.password === values.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const ProfileFormSchema = z.object({
    firstname: z
        .string({ required_error: "First name is required" })
        .trim()
        .min(1, "First name is required")
        .min(3, "First name must have at least 3 characters")
        .max(50, "First name can have at most 50 characters"),
    lastname: z
        .string({ required_error: "Last name is required" })
        .trim()
        .min(1, "Last name is required")
        .max(100, "Last name can have at most 100 characters"),
});
