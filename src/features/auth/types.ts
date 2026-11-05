import type { schemas } from "@/api/generated";
import type { z } from "zod";
import type { authRoutes } from "./routes";
import type { LoginFormSchema, ProfileFormSchema, RegisterFormSchema } from "./schemas";

export type RefreshToken = z.infer<typeof schemas.RefreshTokenResponseDto>;

export type LoginForm = z.infer<typeof LoginFormSchema>;
export type RegisterForm = z.infer<typeof RegisterFormSchema>;
export type ProfileForm = z.infer<typeof ProfileFormSchema>;

export type OnboardingRouteName =
    typeof authRoutes.verifyEmail.name | typeof authRoutes.completeProfile.name;
